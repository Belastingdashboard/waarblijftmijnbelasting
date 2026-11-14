/*
 * Rekenmodel belasting en toeslagen 2026.
 * Alle bedragen en percentages komen uit officiële bronnen (zie BRONNEN onderaan).
 * Er staan geen geschatte cijfers in dit bestand. Wat niet bekend is, staat op null.
 */
(function (root) {
  'use strict';

  var P2026 = {
    jaar: 2026,
    // Box 1 (Belastingdienst, Bijlage loonheffingen 2026, tabel 1)
    schijf1Grens: 38883,
    schijf2Grens: 78426,
    tarief1: 0.3575,
    tarief1Aow: 0.1785,
    tarief2: 0.3756,
    tarief3: 0.4950,
    // Opbouw schijf 1
    premieAow: 0.1790, premieAnw: 0.0010, premieWlz: 0.0965, belastingSchijf1: 0.0810,
    // Algemene heffingskorting
    ahkMax: 3115, ahkMaxAow: 1556, ahkAfbouwStart: 29736,
    ahkAfbouw: 0.06398, ahkAfbouwAow: 0.03195,
    // Arbeidskorting: [ondergrens, basisbedrag, percentage]
    ak: [[0, 0, 0.08324], [11965, 996, 0.31009], [25845, 5300, 0.01950], [45592, 5685, -0.06510]],
    akAow: [[0, 0, 0.04156], [11965, 498, 0.15483], [25845, 2647, 0.00974], [45592, 2840, -0.03250]],
    akEinde: 132920,
    // Inkomensafhankelijke combinatiekorting
    iackDrempel: 6239, iackPct: 0.1145, iackMax: 3032, iackPctAow: 0.0572, iackMaxAow: 1513,
    // Ouderenkorting
    okMax: 2067, okAfbouwStart: 46002, okAfbouw: 0.15, alleenstaandeOuderenkorting: 540,
    // Zvw
    zvwWerkgever: 0.0610, zvwZelf: 0.0485, zvwMaxInkomen: 79409,
    zorgpremieGemiddeld: 1884, eigenRisico: 385,
    // Ondernemers
    zelfstandigenaftrek: 1200, startersaftrek: 2123, mkbVrijstelling: 0.127,
    maxAftrekTarief: 0.3756,
    // Werkgeverspremies (over loon tot zvwMaxInkomen)
    wwLaag: 0.0274, aofLaag: 0.0627, aofHoog: 0.0763, wko: 0.0050, whkGemiddeld: 0.0152,
    // Zorgtoeslag (Dienst Toeslagen, rekenblad 2026)
    zt: {
      drempel: 29736, afbouw: 0.1373,
      alleen: { standaardpremie: 2119, pct: 0.01912, maxInkomen: 40857 },
      partner: { standaardpremie: 4238, pct: 0.04289, maxInkomen: 51142 }
    },
    // Kindgebonden budget
    kgb: {
      perKind: 2580, alleenstaandeOuderKop: 3416,
      extra12tot15: 724, extra16en17: 964,
      afbouw: 0.076, grensAlleen: 29736, grensPartner: 39141
    },
    // Kinderbijslag per kind per kwartaal (SVB): [1e en 2e kwartaal, 3e en 4e kwartaal]
    kb: { k0tot5: [295.07, 298.40], k6tot11: [358.30, 362.35], k12tot17: [421.53, 426.29] },
    // Huurtoeslag (stelsel per 1-1-2026), bedragen per maand
    ht: {
      huurgrens: 932.93, kwaliteitskortingsgrens: 498.20,
      basishuur1: 202.52, basishuurMeer: 200.71,
      aftop12: 713.02, aftop3plus: 764.14,
      ijkpunt1: 23425, ijkpuntMeer: 31500, afbouw1: 0.27, afbouwMeer: 0.22
    }
  };

  function schijven(inkomen, p, aow) {
    var t1 = aow ? p.tarief1Aow : p.tarief1;
    var a = Math.min(inkomen, p.schijf1Grens);
    var b = Math.min(Math.max(inkomen - p.schijf1Grens, 0), p.schijf2Grens - p.schijf1Grens);
    var c = Math.max(inkomen - p.schijf2Grens, 0);
    return { s1: a * t1, s2: b * p.tarief2, s3: c * p.tarief3, totaal: a * t1 + b * p.tarief2 + c * p.tarief3 };
  }

  function algemeneHeffingskorting(v, p, aow) {
    var max = aow ? p.ahkMaxAow : p.ahkMax, pct = aow ? p.ahkAfbouwAow : p.ahkAfbouw;
    if (v > p.schijf2Grens) return 0;
    return Math.max(0, max - pct * Math.max(0, v - p.ahkAfbouwStart));
  }

  function arbeidskorting(a, p, aow) {
    if (a <= 0 || a > p.akEinde) return 0;
    var t = aow ? p.akAow : p.ak, rij = t[0];
    for (var i = 0; i < t.length; i++) if (a > t[i][0]) rij = t[i];
    return Math.max(0, rij[1] + rij[2] * (a - rij[0]));
  }

  function iack(a, p, aow) {
    if (a <= p.iackDrempel) return 0;
    return aow ? Math.min(p.iackMaxAow, p.iackPctAow * (a - p.iackDrempel))
               : Math.min(p.iackMax, p.iackPct * (a - p.iackDrempel));
  }

  function ouderenkorting(v, p) {
    return Math.max(0, p.okMax - p.okAfbouw * Math.max(0, v - p.okAfbouwStart));
  }

  /*
   * invoer: {
   *   type: 'loondienst' | 'ondernemer',
   *   brutoLoon, omzet, kosten,
   *   urencriterium (bool), starter (bool), aow (bool),
   *   partner (bool), partnerInkomen,
   *   kinderen: { k0tot5, k6tot11, k12tot15, k16en17 },
   *   huur (kale huur per maand, 0 = geen huurwoning)
   * }
   */
  function bereken(invoer, p) {
    p = p || P2026;
    var aow = !!invoer.aow;
    var k = invoer.kinderen || {};
    var n0 = k.k0tot5 || 0, n6 = k.k6tot11 || 0, n12 = k.k12tot15 || 0, n16 = k.k16en17 || 0;
    var aantalKinderen = n0 + n6 + n12 + n16;
    var partner = !!invoer.partner;
    var partnerInkomen = partner ? Math.max(0, invoer.partnerInkomen || 0) : 0;
    var r = { type: invoer.type, posten: {} };

    var arbeidsinkomen, belastbaar, aftrekposten = 0;
    if (invoer.type === 'ondernemer') {
      var winst = Math.max(0, (invoer.omzet || 0) - (invoer.kosten || 0));
      var za = 0, sa = 0;
      if (invoer.urencriterium) {
        za = p.zelfstandigenaftrek * (aow ? 0.5 : 1);
        if (invoer.starter) sa = p.startersaftrek * (aow ? 0.5 : 1);
        else za = Math.min(za, winst); // zelfstandigenaftrek niet hoger dan de winst
      }
      var naAftrek = Math.max(0, winst - za - sa);
      var mkb = p.mkbVrijstelling * naAftrek;
      belastbaar = naAftrek - mkb;
      aftrekposten = winst - belastbaar;
      arbeidsinkomen = winst;
      r.winst = winst; r.zelfstandigenaftrek = za; r.startersaftrek = sa; r.mkbVrijstelling = mkb;
    } else {
      belastbaar = Math.max(0, invoer.brutoLoon || 0);
      arbeidsinkomen = belastbaar;
    }
    r.bruto = invoer.type === 'ondernemer' ? r.winst : belastbaar;
    r.belastbaarInkomen = belastbaar;

    var s = schijven(belastbaar, p, aow);
    // Aftrekposten zijn in de hoogste schijf maximaal 37,56% waard
    var correctie = 0;
    if (aftrekposten > 0) {
      var inTop = Math.min(aftrekposten, Math.max(0, belastbaar + aftrekposten - p.schijf2Grens));
      correctie = (p.tarief3 - p.maxAftrekTarief) * inTop;
    }
    var belastingVoorKorting = s.totaal + correctie;

    var ahk = algemeneHeffingskorting(belastbaar, p, aow);
    var ak = arbeidskorting(arbeidsinkomen, p, aow);
    // IACK: kind jonger dan 12, en geen partner of het laagste arbeidsinkomen van de twee
    var heeftJongKind = (n0 + n6) > 0;
    var ic = heeftJongKind && (!partner || arbeidsinkomen < partnerInkomen) ? iack(arbeidsinkomen, p, aow) : 0;
    var ok = aow ? ouderenkorting(belastbaar, p) : 0;
    var aok = aow && !partner ? p.alleenstaandeOuderenkorting : 0;
    var kortingenTotaal = ahk + ak + ic + ok + aok;
    var kortingenBenut = Math.min(kortingenTotaal, belastingVoorKorting);
    var inkomstenbelasting = belastingVoorKorting - kortingenBenut;

    var zvwZelf = invoer.type === 'ondernemer' ? p.zvwZelf * Math.min(belastbaar, p.zvwMaxInkomen) : 0;

    r.schijven = s;
    r.tariefsaanpassing = correctie;
    r.belastingVoorKorting = belastingVoorKorting;
    r.kortingen = { algemeen: ahk, arbeid: ak, combinatie: ic, ouderen: ok, alleenstaandeOuderen: aok,
                    totaal: kortingenTotaal, benut: kortingenBenut };
    r.inkomstenbelasting = inkomstenbelasting;
    r.zvwZelf = zvwZelf;
    r.heffingTotaal = inkomstenbelasting + zvwZelf;
    r.netto = r.bruto - r.heffingTotaal;

    // Verdeling van de heffing in schijf 1 over belasting en premies (naar rato van de tarieven)
    var t1 = aow ? p.tarief1Aow : p.tarief1;
    var premieDeel = (t1 - p.belastingSchijf1) / t1;
    var aandeelNaKorting = belastingVoorKorting > 0 ? inkomstenbelasting / belastingVoorKorting : 0;
    r.waarvanPremiesVolksverzekeringen = s.s1 * premieDeel * aandeelNaKorting;

    // Wat de werkgever bovenop het loon afdraagt (alleen loondienst)
    if (invoer.type !== 'ondernemer') {
      var grondslag = Math.min(belastbaar, p.zvwMaxInkomen);
      r.werkgever = {
        zvw: p.zvwWerkgever * grondslag,
        ww: p.wwLaag * grondslag,
        aofLaag: p.aofLaag * grondslag,
        aofHoog: p.aofHoog * grondslag,
        wko: p.wko * grondslag,
        whk: p.whkGemiddeld * grondslag
      };
      r.werkgever.totaalLaag = r.werkgever.zvw + r.werkgever.ww + r.werkgever.aofLaag + r.werkgever.wko + r.werkgever.whk;
      r.werkgever.totaalHoog = r.werkgever.totaalLaag - r.werkgever.aofLaag + r.werkgever.aofHoog;
    }

    // ---- Toeslagen en kinderbijslag ----
    var toets = belastbaar + partnerInkomen;
    r.toetsingsinkomen = toets;

    var z = partner ? p.zt.partner : p.zt.alleen, zorgtoeslag = 0;
    if (toets <= z.maxInkomen) {
      var norm = z.pct * p.zt.drempel + p.zt.afbouw * Math.max(0, toets - p.zt.drempel);
      zorgtoeslag = Math.max(0, Math.floor((z.standaardpremie - norm) / 12)) * 12;
    }

    var kgb = 0;
    if (aantalKinderen > 0) {
      var maxKgb = p.kgb.perKind * aantalKinderen + (partner ? 0 : p.kgb.alleenstaandeOuderKop)
                 + p.kgb.extra12tot15 * n12 + p.kgb.extra16en17 * n16;
      var grens = partner ? p.kgb.grensPartner : p.kgb.grensAlleen;
      // Dienst Toeslagen rondt het maandbedrag af naar beneden op hele euro's
      kgb = Math.floor(Math.max(0, maxKgb - p.kgb.afbouw * Math.max(0, toets - grens)) / 12) * 12;
    }

    var kinderbijslag = 2 * (n0 * (p.kb.k0tot5[0] + p.kb.k0tot5[1])
                           + n6 * (p.kb.k6tot11[0] + p.kb.k6tot11[1])
                           + (n12 + n16) * (p.kb.k12tot17[0] + p.kb.k12tot17[1]));

    var huurtoeslag = 0, huur = invoer.huur || 0;
    if (huur > 0) {
      var h = p.ht, personen = 1 + (partner ? 1 : 0) + aantalKinderen;
      var R = Math.min(huur, h.huurgrens);
      var basis = personen === 1 ? h.basishuur1 : h.basishuurMeer;
      var aftop = personen <= 2 ? h.aftop12 : h.aftop3plus;
      if (R > basis) {
        var A = Math.min(R, h.kwaliteitskortingsgrens) - basis;
        var B = R > h.kwaliteitskortingsgrens ? 0.65 * (Math.min(R, aftop) - h.kwaliteitskortingsgrens) : 0;
        var C = R > aftop ? 0.40 * (R - aftop) : 0;
        var D = Math.max(0, toets - (personen === 1 ? h.ijkpunt1 : h.ijkpuntMeer))
              * (personen === 1 ? h.afbouw1 : h.afbouwMeer) / 12;
        huurtoeslag = Math.max(0, Math.floor(A + B + C - D)) * 12;
      }
    }

    r.toeslagen = { zorgtoeslag: zorgtoeslag, kindgebondenBudget: kgb, kinderbijslag: kinderbijslag,
                    huurtoeslag: huurtoeslag,
                    totaal: zorgtoeslag + kgb + kinderbijslag + huurtoeslag };
    r.nettoInclToeslagen = r.netto + r.toeslagen.totaal;
    return r;
  }

  var BRONNEN = {
    loonheffingen: 'https://download.belastingdienst.nl/belastingdienst/docs/bijlage-nieuwsbrief-loonheffingen-2026-lh2091b63fd.pdf',
    box1: 'https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/prive/inkomstenbelasting/heffingskortingen_boxen_tarieven/boxen_en_tarieven/box_1/box_1',
    ahk: 'https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/prive/inkomstenbelasting/heffingskortingen_boxen_tarieven/heffingskortingen/algemene_heffingskorting/tabel-algemene-heffingskorting-2026',
    arbeidskorting: 'https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/prive/inkomstenbelasting/heffingskortingen_boxen_tarieven/heffingskortingen/arbeidskorting/tabel-arbeidskorting-2026',
    zvw: 'https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/prive/werk_en_inkomen/zorgverzekeringswet/veranderingen-bijdrage-zvw/percentages-zvw',
    zelfstandigenaftrek: 'https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/zakelijk/winst/inkomstenbelasting/veranderingen-inkomstenbelasting-2026/ondernemersaftrek-2026/zelfstandigenaftrek-2026',
    zorgtoeslag: 'https://download.belastingdienst.nl/toeslagen/docs/berekening_zorgtoeslag_tg0821z61fd.pdf',
    kindgebondenBudget: 'https://download.belastingdienst.nl/toeslagen/docs/berekening_kindgebonden_budget_tg0811z61fd.pdf',
    huurtoeslag: 'https://download.belastingdienst.nl/toeslagen/docs/berekening_huurtoeslag_tg0831z61fd.pdf',
    kinderbijslag: 'https://www.svb.nl/nl/kinderbijslag/bedragen-betaaldagen/bedragen-kinderbijslag',
    zorgpremie: 'https://www.rijksoverheid.nl/onderwerpen/zorgverzekering/vraag-en-antwoord/premie-zorgverzekering'
  };

  var api = { P2026: P2026, bereken: bereken, BRONNEN: BRONNEN,
              arbeidskorting: arbeidskorting, algemeneHeffingskorting: algemeneHeffingskorting };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Belasting = api;
})(typeof window !== 'undefined' ? window : this);
