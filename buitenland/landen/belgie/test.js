// Controle van het Belgische rekenmodel tegen officiële rekenvoorbeelden en tabellen.
// Starten met: node buitenland/landen/belgie/test.js
// Werkt ook in de browser: buitenland/proef.html laadt dit bestand en toont de uitkomst.
(function (root) {
  'use strict';
  var node = typeof module !== 'undefined' && module.exports;
  var B = node ? require('./model.js') : root.BelastingBelgie;
  var R = node ? require('./regels.js') : root.RegelsBelgie;
  var D = node ? require('./data.js') : root.DataBelgie;
  var P = R.P2026, fout = 0, regels = [];
  function log(t) { regels.push(t); if (typeof console !== 'undefined') console.log(t); }
  function check(naam, gekregen, verwacht, marge) {
    var ok = Math.abs(gekregen - verwacht) < (marge || 0.005);
    if (!ok) fout++;
    log((ok ? 'OK   ' : 'FOUT ') + naam + ': ' + gekregen + ' (verwacht ' + verwacht + ')');
  }
  function loon(b, extra) {
    var inv = { type: 'loondienst', brutoLoon: b, gemeentebelasting: 0 };
    for (var k in (extra || {})) inv[k] = extra[k];
    return B.bereken(inv);
  }

  // FOD Financiën, rekenvoorbeeld inkomstenjaar 2025: belastbaar inkomen € 38.000, alleenstaand, geen kinderen
  // -> € 13.212 volgens de schijven, min € 2.727,50 voor de belastingvrije som = € 10.484,50
  var s25 = B.schijven(38000, R.P2025);
  check('FOD-voorbeeld 2025: schijf 1', s25.delen[0], 4080);
  check('FOD-voorbeeld 2025: schijf 2', s25.delen[1], 4992);
  check('FOD-voorbeeld 2025: schijf 3', s25.delen[2], 4140);
  var vrij25 = B.schijven(B.belastingvrijeSom(0, true, R.P2025).totaal, R.P2025).totaal;
  check('FOD-voorbeeld 2025: vrijstelling', vrij25, 2727.50);
  check('FOD-voorbeeld 2025: belasting', s25.totaal - vrij25, 10484.50);

  // Schijven 2026 (tabel FOD Financiën): op de grenzen 16.720, 29.510 en 51.070
  check('Belasting 2026 bij € 16.720', B.schijven(16720, P).totaal, 4180);
  check('Belasting 2026 bij € 29.510', B.schijven(29510, P).totaal, 4180 + 5116);
  check('Belasting 2026 bij € 51.070', B.schijven(51070, P).totaal, 4180 + 5116 + 9702);
  // Belastingvrije som 2026 (FOD Financiën): basis, 2 kinderen, 5 kinderen, alleenstaande met 1 kind
  check('Belastingvrije som zonder kinderen', B.belastingvrijeSom(0, true, P).totaal, 11550);
  check('Belastingvrije som met 2 kinderen en partner', B.belastingvrijeSom(2, false, P).totaal, 11550 + 5230);
  check('Belastingvrije som met 5 kinderen en partner', B.belastingvrijeSom(5, false, P).totaal, 11550 + 18970 + 7240);
  check('Belastingvrije som alleenstaande met 1 kind', B.belastingvrijeSom(1, true, P).totaal, 11550 + 2030 + 2030);
  // Forfaitaire beroepskosten (FOD Financiën): 30%, maximaal € 6.070
  check('Beroepskosten bij € 10.000', B.forfaitaireBeroepskosten(10000, P), 3000);
  check('Beroepskosten bij € 40.000', B.forfaitaireBeroepskosten(40000, P), 6070);

  // Sociale werkbonus bedienden (tabellen RSZ)
  var w = B.werkbonusMaand(2300, 7, P);
  check('Werkbonus juli, loon € 2.300: luik A', w.a, 127.54);
  check('Werkbonus juli, loon € 2.300: luik B', w.b, 171.99);
  // De werkbonus is nooit hoger dan de bijdrage zelf: bij € 2.000 is die 13,07% = € 261,40
  var w2 = B.werkbonusMaand(2000, 7, P);
  check('Werkbonus juli, loon € 2.000: samen niet meer dan de bijdrage', w2.a + w2.b, 261.40);
  check('Werkbonus september, loon € 3.403,62: luik A', B.werkbonusMaand(3403.62, 9, P).a, 0, 0.02);
  check('Werkbonus september, loon € 3.500: luik A', B.werkbonusMaand(3500, 9, P).a, 0);
  check('Werkbonus januari, loon € 2.833,36: luik B', B.werkbonusMaand(2833.36, 1, P).b, 0, 0.02);
  check('Werkbonus april, loon € 2.880,32: luik A', B.werkbonusMaand(2880.32, 4, P).a, 125.04);
  // Het jaarmaximum (€ 3.594,36) wordt bij een vast maandloon nooit bereikt
  if (B.werkbonusJaar(24000, P).totaal > P.werkbonusJaarMax) { fout++; log('FOUT werkbonus boven het jaarmaximum'); }
  else log('OK   Werkbonus blijft onder het jaarmaximum');

  // Bijzondere bijdrage sociale zekerheid (RSZ): bedragen per kwartaal op de schijfgrenzen, individuele aanslag
  check('Bijzondere bijdrage bij maandloon € 1.945,38', B.bbszKwartaal(1945.38, P, 'alleen'), 0);
  check('Bijzondere bijdrage bij maandloon € 2.190,18', B.bbszKwartaal(2190.18, P, 'alleen'), 30.99, 0.02);
  check('Bijzondere bijdrage bij maandloon € 3.737,00', B.bbszKwartaal(3737, P, 'alleen'), 82.05, 0.02);
  // De bron geeft hier € 118,83; de formule van de schijf eronder komt op € 118,86. Verschil door afronding in de bron.
  check('Bijzondere bijdrage bij maandloon € 4.100,00', B.bbszKwartaal(4100, P, 'alleen'), 118.83, 0.04);
  check('Bijzondere bijdrage bij maandloon € 7.000', B.bbszKwartaal(7000, P, 'alleen'), 182.82);
  check('Bijzondere bijdrage tweeverdieners, maandloon € 1.500', B.bbszKwartaal(1500, P, 'samenTweeInkomens'), 15.45);
  check('Bijzondere bijdrage tweeverdieners, maandloon € 2.190,18', B.bbszKwartaal(2190.18, P, 'samenTweeInkomens'), 43.32, 0.02);
  check('Bijzondere bijdrage tweeverdieners, maandloon € 20.000', B.bbszKwartaal(20000, P, 'samenTweeInkomens'), 154.92);

  // Zelfstandigen (RSVZ, Sociale bijdragen 2026): minimum- en maximumbijdrage per kwartaal
  check('Minimumbijdrage zelfstandige per kwartaal', B.socialeBijdragenZelfstandige(0, P) / 4, 890.42);
  check('Minimumbijdrage primostarter per kwartaal', B.socialeBijdragenZelfstandige(0, P, { starter: true }) / 4, 459.82, 0.01);
  check('Maximumbijdrage zelfstandige per kwartaal', B.socialeBijdragenZelfstandige(500000, P) / 4, 5103.05, 0.01);
  check('Maximumbijdrage gepensioneerde zelfstandige per kwartaal', B.socialeBijdragenZelfstandige(500000, P, { pensioen: true }) / 4, 4015.19, 0.01);

  // Samenhang: netto + heffing = bruto, en geen negatieve personenbelasting
  [0, 5000, 15000, 30000, 60000, 100000, 200000].forEach(function (b) {
    var r = loon(b);
    check('Netto + heffing = bruto bij € ' + b, r.netto + r.heffingTotaal, b);
    if (r.personenbelasting < 0) { fout++; log('FOUT negatieve personenbelasting bij ' + b); }
  });
  var z = B.bereken({ type: 'ondernemer', omzet: 70000, kosten: 10000, gemeentebelasting: 0 });
  check('Zelfstandige: bijdrage klopt met de regel', z.socialeBijdragen, B.socialeBijdragenZelfstandige(z.winst - z.socialeBijdragen, P), 0.01);
  check('Zelfstandige: netto + heffing = winst', z.netto + z.heffingTotaal, 60000);
  // Gemeentebelasting is een percentage van de personenbelasting
  var g0 = loon(40000), g7 = loon(40000, { gemeentebelasting: 0.07 });
  check('Gemeentebelasting 7%', g7.gemeentebelasting, 0.07 * g0.personenbelasting);
  // Zonder ingevuld tarief blijft de gemeentebelasting onbekend (null)
  if (B.bereken({ type: 'loondienst', brutoLoon: 40000 }).gemeentebelasting !== null) { fout++; log('FOUT gemeentebelasting hoort null te zijn zonder tarief'); }
  else log('OK   Gemeentebelasting is onbekend zonder tarief');
  // Kinderbijslag: Vlaanderen, twee kinderen van 0 t/m 5 jaar -> 2 x 12 x € 190,66
  check('Groeipakket twee jonge kinderen', loon(40000, { gewest: 'vlaanderen', kinderen: { k0tot5: 2 } }).toeslagen.kinderbijslag, 4575.84);
  if (loon(40000, { gewest: 'vlaanderen', kinderen: { k6tot11: 1 } }).toeslagen.kinderbijslag !== null) { fout++; log('FOUT kinderbijslag oudere kinderen hoort null te zijn'); }
  else log('OK   Kinderbijslag voor oudere kinderen is onbekend');

  // ---- Controles op de uitgavencijfers ----
  var som = function (l) { return l.reduce(function (a, x) { return a + x.mld; }, 0); };
  check('Uitgaven tellen op tot het totaal', som(D.UITGAVEN), D.UITGAVEN_TOTAAL, 0.0002);
  var gebruikt = [].concat.apply([], D.GROEPEN.map(function (g) { return g.delen; })).sort().join(',');
  var bestaand = D.UITGAVEN.map(function (u) { return u.id; }).sort().join(',');
  if (gebruikt !== bestaand) { fout++; log('FOUT groepen en onderdelen komen niet overeen'); }
  else log('OK   Elk onderdeel zit in precies één groep');
  if (som(D.INKOMSTEN) > D.INKOMSTEN_TOTAAL) { fout++; log('FOUT inkomstenposten zijn samen hoger dan het totaal'); }
  else log('OK   Inkomstenposten passen binnen het totaal');

  log(fout ? fout + ' fout(en)' : 'Alle controles geslaagd');
  if (node) process.exit(fout ? 1 : 0);
  else root.TestBelgie = { fout: fout, regels: regels };
})(typeof window !== 'undefined' ? window : this);
