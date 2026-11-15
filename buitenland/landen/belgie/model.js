/*
 * Rekenmodel België, inkomstenjaar 2026 (aanslagjaar 2027).
 * Zelfde invoer als site/model.js, met drie extra velden voor België (zie bereken).
 * De cijfers staan in regels.js. Keuzes en aannames staan in OPEN-PUNTEN.md.
 */
(function (root) {
  'use strict';

  var R = (typeof module !== 'undefined' && module.exports) ? require('./regels.js') : root.RegelsBelgie;
  var P2026 = R.P2026;

  function cent(x) { return Math.round(x * 100) / 100; }

  // Belasting volgens de schijven. Geeft het bedrag per schijf en het totaal.
  function schijven(inkomen, p) {
    var s = p.schijven, delen = [], totaal = 0;
    for (var i = 0; i < s.length; i++) {
      var tot = i + 1 < s.length ? s[i + 1][0] : Infinity;
      var deel = Math.max(0, Math.min(inkomen, tot) - s[i][0]) * s[i][1];
      delen.push(deel); totaal += deel;
    }
    return { delen: delen, totaal: totaal };
  }

  // Belastingvrije som: basisbedrag, verhoging voor kinderen ten laste en voor een alleenstaande met kinderen
  function belastingvrijeSom(aantalKinderen, alleenstaand, p) {
    var n = Math.max(0, aantalKinderen || 0);
    var kinderen = p.bvsKinderen[Math.min(n, 4)] + Math.max(0, n - 4) * p.bvsPerExtraKind;
    var alleen = n > 0 && alleenstaand ? p.bvsAlleenstaandeMetKinderen : 0;
    return { basis: p.belastingvrijeSom, kinderen: kinderen, alleenstaande: alleen,
             totaal: p.belastingvrijeSom + kinderen + alleen };
  }

  // Forfaitaire beroepskosten voor werknemers: 30% van het loon na sociale bijdragen, met een maximum
  function forfaitaireBeroepskosten(belastbaarBruto, p) {
    return Math.min(p.forfaitPct * Math.max(0, belastbaarBruto), p.forfaitMax);
  }

  // Sociale werkbonus voor één maand: { a, b } volgens de tabel van die periode. t = [max, tot, afbouw, nul boven]
  function luik(S, t) {
    if (S <= t[1]) return t[0];
    if (S > t[3]) return 0;
    return Math.max(0, cent(t[0] - t[2] * (S - t[1])));
  }
  function werkbonusMaand(maandloon, maand, p) {
    var per = null;
    for (var i = 0; i < p.werkbonus.length; i++) if (p.werkbonus[i].maanden.indexOf(maand) >= 0) per = p.werkbonus[i];
    if (!per || !(maandloon > 0)) return { a: 0, b: 0 };
    var a = luik(maandloon, per.a), b = luik(maandloon, per.b);
    // Nooit meer dan de bijdrage zelf: eerst luik B inkorten, dan luik A
    var ruimte = cent(p.rszWerknemer * maandloon);
    if (a + b > ruimte) { b = Math.max(0, ruimte - a); a = Math.min(a, ruimte); }
    return { a: a, b: b };
  }
  function werkbonusJaar(brutoJaar, p) {
    var a = 0, b = 0, m = brutoJaar / 12;
    for (var maand = 1; maand <= 12; maand++) { var w = werkbonusMaand(m, maand, p); a += w.a; b += w.b; }
    var totaal = a + b;
    if (totaal > p.werkbonusJaarMax) { var f = p.werkbonusJaarMax / totaal; a *= f; b *= f; }
    return { a: a, b: b, totaal: a + b };
  }

  // Bijzondere bijdrage voor de sociale zekerheid, per kwartaal, bij een vast maandloon.
  // soort: 'alleen' (individuele aanslag), 'samenTweeInkomens' of 'samenEenInkomen' (gemeenschappelijke aanslag)
  function bbszKwartaal(maandloon, p, soort) {
    var rijen = soort === 'alleen' || !soort ? p.bbszAlleen : p.bbszSamen, rij = null;
    for (var i = 0; i < rijen.length; i++) if (maandloon > rijen[i][0]) rij = rijen[i];
    var bedrag = rij ? rij[1] + rij[2] * (maandloon - rij[0]) * 3 : 0;
    if (soort === 'samenTweeInkomens') {
      if (maandloon * 3 >= p.bbszSamenVastVanaf) bedrag = Math.max(bedrag, p.bbszSamenVast);
      return cent(Math.min(bedrag, p.bbszSamenMax));
    }
    if (soort === 'samenEenInkomen') return cent(Math.min(bedrag, p.bbszSamenEenInkomenMax));
    return cent(Math.min(bedrag, p.bbszAlleenMax));
  }

  // Sociale bijdragen van een zelfstandige in hoofdberoep, per jaar, over het inkomen I (zonder beheerskosten)
  function socialeBijdragenZelfstandige(I, p, opties) {
    var z = p.zelfstandige, o = opties || {};
    I = Math.max(0, I || 0);
    if (o.pensioen) {
      var g = z.pensioen;
      if (I < g.vrijTot) return 0;
      var b = g.pct1 * Math.min(I, z.grens1) + g.pct2 * Math.max(0, Math.min(I, z.grens2) - z.grens1);
      return Math.min(Math.max(b, 4 * g.minPerKwartaal), 4 * g.maxPerKwartaal);
    }
    var basis = Math.max(I, o.starter ? z.minInkomenPrimostarter : z.minInkomen);
    return z.pct1 * Math.min(basis, z.grens1) + z.pct2 * Math.max(0, Math.min(basis, z.grens2) - z.grens1);
  }

  /*
   * invoer: dezelfde velden als site/model.js:
   *   type: 'loondienst' | 'ondernemer', brutoLoon, omzet, kosten,
   *   urencriterium, starter, aow, partner, partnerInkomen,
   *   kinderen: { k0tot5, k6tot11, k12tot15, k16en17 }, huur, woz, hypotheekrente
   * extra voor België (alle drie optioneel):
   *   gemeentebelasting: tarief van je gemeente als breuk (0.07 = 7%). Niet ingevuld = onbekend, telt als 0.
   *   gewest: 'vlaanderen' | 'wallonie' | 'brussel' (voor de kinderbijslag)
   *   gehuwd: true als je gehuwd bent of wettelijk samenwoont (gemeenschappelijke aanslag)
   */
  function bereken(invoer, p) {
    p = p || P2026;
    var k = invoer.kinderen || {};
    var n0 = k.k0tot5 || 0, n6 = k.k6tot11 || 0, n12 = k.k12tot15 || 0, n16 = k.k16en17 || 0;
    var aantalKinderen = n0 + n6 + n12 + n16;
    var partner = !!invoer.partner, gehuwd = partner && !!invoer.gehuwd;
    var partnerInkomen = partner ? Math.max(0, invoer.partnerInkomen || 0) : 0;
    var zzp = invoer.type === 'ondernemer';
    var r = { land: 'belgie', type: invoer.type, som: [], nietMeegenomen: [], onbekend: [] };
    function rij(naam, bedrag, totaal) { r.som.push({ naam: naam, bedrag: bedrag, totaal: !!totaal }); }

    var belastbaar, sociaal = 0, wb = { a: 0, b: 0, totaal: 0 }, bbsz = 0;
    if (zzp) {
      var winst = Math.max(0, (invoer.omzet || 0) - (invoer.kosten || 0));
      // De bijdrage wordt berekend over het inkomen na aftrek van de bijdrage zelf.
      // We zoeken het bedrag waarbij bijdrage = regel(winst min bijdrage). Zie OPEN-PUNTEN.md, punt C1.
      var opt = { starter: !!invoer.starter, pensioen: !!invoer.aow };
      var laag = 0, hoog = socialeBijdragenZelfstandige(winst, p, opt);
      for (var i = 0; i < 60; i++) {
        var mid = (laag + hoog) / 2;
        if (socialeBijdragenZelfstandige(winst - mid, p, opt) > mid) laag = mid; else hoog = mid;
      }
      sociaal = winst > 0 ? (laag + hoog) / 2 : 0;
      belastbaar = Math.max(0, winst - sociaal);
      r.winst = winst; r.bruto = winst; r.socialeBijdragen = sociaal;
      rij('Winst (wat binnenkomt min je kosten)', winst);
      rij('Sociale bijdragen als zelfstandige', -sociaal);
      rij('Hierover betaal je belasting', belastbaar, true);
    } else {
      var bruto = Math.max(0, invoer.brutoLoon || 0);
      var rsz = p.rszWerknemer * bruto;
      wb = werkbonusJaar(bruto, p);
      sociaal = rsz - wb.totaal;
      var belastbaarBruto = bruto - sociaal;
      var kosten = forfaitaireBeroepskosten(belastbaarBruto, p);
      belastbaar = belastbaarBruto - kosten;
      var soort = !gehuwd ? 'alleen' : partnerInkomen > 0 ? 'samenTweeInkomens' : 'samenEenInkomen';
      bbsz = 4 * bbszKwartaal(bruto / 12, p, soort);
      r.bruto = bruto; r.rsz = rsz; r.werkbonus = wb; r.belastbaarBruto = belastbaarBruto; r.beroepskosten = kosten;
      rij('Bruto salaris', bruto, true);
      rij('Bijdrage sociale zekerheid (13,07%)', -rsz);
      if (wb.totaal) rij('Werkbonus (korting op die bijdrage bij een laag loon)', wb.totaal);
      rij('Forfaitaire beroepskosten (30%, maximaal € 6.070)', -kosten);
      rij('Hierover betaal je belasting', belastbaar, true);
    }
    r.belastbaarInkomen = belastbaar;

    // Personenbelasting: schijven, min de belasting over de belastingvrije som
    var s = schijven(belastbaar, p);
    var bvs = belastingvrijeSom(aantalKinderen, !partner, p);
    var opVrij = schijven(bvs.totaal, p).totaal;
    var vermindering = Math.min(opVrij, s.totaal);
    var pb = s.totaal - vermindering;

    // Terugbetaalbaar belastingkrediet voor kinderen: het deel van de vrijstelling voor kinderen dat je niet kon gebruiken
    var kindKrediet = 0;
    if (aantalKinderen > 0) {
      var kindDeel = opVrij - schijven(bvs.totaal - bvs.kinderen, p).totaal;
      kindKrediet = Math.min(opVrij - vermindering, kindDeel, p.kredietPerKind * aantalKinderen);
    }
    // Fiscale werkbonus: belastingkrediet op basis van de sociale werkbonus
    var fiscaleWb = Math.min(p.fiscaleWerkbonusA * wb.a + p.fiscaleWerkbonusB * wb.b, p.fiscaleWerkbonusMax);

    // Gemeentebelasting: percentage van de personenbelasting
    var gemPct = invoer.gemeentebelasting, gem = null;
    if (typeof gemPct === 'number' && gemPct >= 0) gem = gemPct * pb;
    else r.onbekend.push('Gemeentebelasting: het tarief van je gemeente is niet ingevuld. Die belasting telt nu niet mee.');

    r.schijven = s;
    r.belastingvrijeSom = { bedrag: bvs.totaal, opbouw: bvs, vermindering: vermindering };
    r.personenbelasting = pb;
    r.gemeentebelasting = gem;
    r.bbsz = bbsz;
    r.kredieten = { fiscaleWerkbonus: fiscaleWb, kinderen: kindKrediet, totaal: fiscaleWb + kindKrediet };
    r.inkomstenbelasting = pb + (gem || 0) - r.kredieten.totaal;
    r.heffingTotaal = sociaal + bbsz + r.inkomstenbelasting;
    r.netto = r.bruto - r.heffingTotaal;

    for (var j = 0; j < s.delen.length; j++) if (s.delen[j]) rij('Belasting schijf ' + (j + 1) + ' (' + Math.round(p.schijven[j][1] * 100) + '%)', s.delen[j]);
    rij('Belastingvrije som (vrijstelling over de eerste € ' + String(bvs.totaal).replace(/\B(?=(\d{3})+$)/g, '.') + ')', -vermindering);
    rij('Personenbelasting', pb, true);
    if (gem !== null) rij('Gemeentebelasting', gem);
    if (bbsz) rij('Bijzondere bijdrage sociale zekerheid', bbsz);
    if (fiscaleWb) rij('Fiscale werkbonus (krijg je terug)', -fiscaleWb);
    if (kindKrediet) rij('Belastingkrediet voor kinderen (krijg je terug)', -kindKrediet);
    rij('Dit houd je over', r.netto, true);

    // Wat de werkgever bovenop het loon afdraagt (alleen loondienst), vóór verminderingen
    if (!zzp) {
      r.werkgever = { basis: p.werkgeverBasis * r.bruto, loonmatiging: p.werkgeverLoonmatiging * r.bruto };
      r.werkgever.totaalLaag = r.werkgever.totaalHoog = r.werkgever.basis + r.werkgever.loonmatiging;
    }

    // Kinderbijslag: alleen Vlaanderen, en alleen als alle kinderen na 2018 geboren zijn (in 2026: 0 t/m 5 jaar)
    var kb = null, gewest = invoer.gewest, kbRegels = gewest ? p.kinderbijslag[gewest] : null;
    if (aantalKinderen === 0) kb = 0;
    else if (kbRegels && n6 + n12 + n16 === 0) kb = 12 * kbRegels.basisbedragPerMaand * n0;
    else r.onbekend.push(!gewest ? 'Kinderbijslag: het gewest is niet ingevuld.'
      : !kbRegels ? 'Kinderbijslag: voor dit gewest zijn de bedragen nog niet opgenomen.'
      : 'Kinderbijslag: voor kinderen die vóór 2019 geboren zijn hangt het bedrag af van je gezin op 31 december 2018. Dat vragen we niet.');
    r.toeslagen = { zorgtoeslag: null, kindgebondenBudget: null, huurtoeslag: null, kinderbijslag: kb, totaal: kb || 0 };
    r.nettoInclToeslagen = r.netto + r.toeslagen.totaal;

    // Wat de invoer wel bevat maar het Belgische model niet meerekent
    if ((invoer.woz || 0) > 0 || (invoer.hypotheekrente || 0) > 0) r.nietMeegenomen.push('Koophuis: kadastraal inkomen, onroerende voorheffing en gewestelijke woonvoordelen zijn niet meegenomen.');
    if ((invoer.huur || 0) > 0) r.nietMeegenomen.push('Huur: huurpremies verschillen per gewest en zijn niet meegenomen.');
    if (invoer.aow && !zzp) r.nietMeegenomen.push('Pensioen: de belastingvermindering voor pensioenen is niet meegenomen. Het loon is berekend als voor een gewone werknemer.');
    if (gehuwd) r.nietMeegenomen.push('Gehuwd of wettelijk samenwonend: het huwelijksquotiënt en de belasting van je partner zijn niet meegenomen.');
    if (n0 > 0) r.nietMeegenomen.push('De extra belastingvrije som voor kinderen jonger dan 3 jaar is niet meegenomen.');
    return r;
  }

  var api = { P2026: P2026, BRONNEN: R.BRONNEN, bereken: bereken, schijven: schijven, belastingvrijeSom: belastingvrijeSom,
              forfaitaireBeroepskosten: forfaitaireBeroepskosten, werkbonusMaand: werkbonusMaand, werkbonusJaar: werkbonusJaar,
              bbszKwartaal: bbszKwartaal, socialeBijdragenZelfstandige: socialeBijdragenZelfstandige };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.BelastingBelgie = api;
})(typeof window !== 'undefined' ? window : this);
