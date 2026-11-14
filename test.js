// Controle van het rekenmodel tegen de officiële rekenvoorbeelden 2026 van Dienst Toeslagen
// en tegen de tabellen van de Belastingdienst. Starten met: node test.js
const B = require('./model.js');
let fout = 0;
function check(naam, gekregen, verwacht) {
  const ok = Math.abs(gekregen - verwacht) < 0.5;
  if (!ok) fout++;
  console.log((ok ? 'OK   ' : 'FOUT ') + naam + ': ' + gekregen + ' (verwacht ' + verwacht + ')');
}
const loon = (b, extra) => B.bereken(Object.assign({ type: 'loondienst', brutoLoon: b }, extra || {}));

// Zorgtoeslag, rekenvoorbeeld 1: alleenstaande, € 19.000 -> € 129 per maand
check('Zorgtoeslag voorbeeld 1', loon(19000).toeslagen.zorgtoeslag / 12, 129);
// Kindgebonden budget, voorbeelden 1 t/m 3
check('Kindgebonden budget voorbeeld 1', loon(20000, { partner: true, partnerInkomen: 25000, kinderen: { k0tot5: 1, k6tot11: 1 } }).toeslagen.kindgebondenBudget / 12, 392);
// Let op: het rekenblad noemt in de kop van stap 5 € 510, maar de uitgeschreven berekening
// (5.160 + 1.688 - 445,28 = 6.402,72 per jaar) komt uit op € 533 per maand. Wij volgen de berekening.
check('Kindgebonden budget voorbeeld 2', loon(29000, { partner: true, partnerInkomen: 16000, kinderen: { k12tot15: 1, k16en17: 1 } }).toeslagen.kindgebondenBudget / 12, 533);
check('Kindgebonden budget voorbeeld 3', loon(30000, { kinderen: { k6tot11: 1 } }).toeslagen.kindgebondenBudget / 12, 497);
// Huurtoeslag, rekenvoorbeeld 3: alleenstaande, € 29.000, huur € 710 -> € 307 per maand
check('Huurtoeslag voorbeeld 3', loon(29000, { huur: 710 }).toeslagen.huurtoeslag / 12, 307);
// Arbeidskorting op de schijfgrenzen (tabel Belastingdienst)
check('Arbeidskorting bij € 11.965', B.arbeidskorting(11965, B.P2026), 996);
check('Arbeidskorting bij € 25.845', B.arbeidskorting(25845, B.P2026), 5300);
check('Arbeidskorting bij € 45.592', B.arbeidskorting(45592, B.P2026), 5685);
check('Arbeidskorting bij € 132.921', B.arbeidskorting(132921, B.P2026), 0);
// Algemene heffingskorting
check('Heffingskorting bij € 29.736', B.algemeneHeffingskorting(29736, B.P2026), 3115);
check('Heffingskorting bij € 78.427', B.algemeneHeffingskorting(78427, B.P2026), 0);
// Maximale Zvw-bijdrage ondernemer: 4,85% x € 79.409
check('Maximale Zvw-bijdrage', B.bereken({ type: 'ondernemer', omzet: 200000, kosten: 0, urencriterium: true }).zvwZelf, 3851.34);
// Samenhang: netto + heffing = bruto, en nooit negatieve belasting
for (const b of [0, 5000, 15000, 30000, 60000, 100000, 200000]) {
  const r = loon(b);
  check('Netto + heffing = bruto bij € ' + b, r.netto + r.heffingTotaal, b);
  if (r.inkomstenbelasting < 0) { fout++; console.log('FOUT negatieve belasting bij ' + b); }
}
console.log(fout ? fout + ' fout(en)' : 'Alle controles geslaagd');
process.exit(fout ? 1 : 0);
