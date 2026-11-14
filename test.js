// Controle van het rekenmodel tegen de officiële rekenvoorbeelden 2026 van Dienst Toeslagen
// en tegen de tabellen van de Belastingdienst. Starten met: node test.js
const B = require('./site/model.js');
const D = require('./site/data.js');
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
// Eigenwoningforfait (Belastingdienst): WOZ € 280.000 x 0,35% = € 980
check('Eigenwoningforfait bij WOZ € 280.000', B.eigenwoningforfait(280000, B.P2026), 980);
check('Eigenwoningforfait bij WOZ € 1.350.000', B.eigenwoningforfait(1350000, B.P2026), 4725);
check('Eigenwoningforfait bij WOZ € 1.450.000', B.eigenwoningforfait(1450000, B.P2026), 4725 + 2350);
// Aftrek geen of kleine eigenwoningschuld (Fiscale informatie 2026, 10.4.5): forfait € 1.500, rente € 1.200 -> aftrek € 216
// Een WOZ-waarde van 1.500 / 0,35% geeft precies dat forfait.
const hw = loon(40000, { woz: 1500 / 0.0035, hypotheekrente: 1200 }).woning;
check('Forfait in voorbeeld geringe schuld', hw.forfait, 1500);
check('Aftrek geen of kleine eigenwoningschuld', hw.aftrekGeringeSchuld, 216);
// Hypotheekrente verlaagt het belastbaar inkomen met (rente - forfait)
check('Belastbaar inkomen met koophuis', loon(50000, { woz: 280000, hypotheekrente: 6000 }).belastbaarInkomen, 50000 + 980 - 6000);
// Zonder koophuis verandert er niets
check('Geen koophuis: zelfde belasting', loon(50000, { woz: 0, hypotheekrente: 6000 }).heffingTotaal, loon(50000).heffingTotaal);
// Samenhang: netto + heffing = bruto, en nooit negatieve belasting
for (const b of [0, 5000, 15000, 30000, 60000, 100000, 200000]) {
  const r = loon(b);
  check('Netto + heffing = bruto bij € ' + b, r.netto + r.heffingTotaal, b);
  if (r.inkomstenbelasting < 0) { fout++; console.log('FOUT negatieve belasting bij ' + b); }
}

// ---- Controles op de uitgavencijfers ----
const som = (lijst) => lijst.reduce((a, x) => a + x.mld, 0);
// De onderdelen zijn in de bron afgerond op 0,1 miljard: de som mag daardoor 0,1 afwijken van het officiële totaal.
const afwijking = Math.abs(som(D.UITGAVEN) - D.UITGAVEN_TOTAAL);
if (afwijking > 0.15) { fout++; console.log('FOUT uitgaven tellen op tot ' + som(D.UITGAVEN).toFixed(1) + ', officieel totaal is ' + D.UITGAVEN_TOTAAL); }
else console.log('OK   Uitgaven tellen op tot ' + som(D.UITGAVEN).toFixed(1) + ' (officieel totaal ' + D.UITGAVEN_TOTAAL + ', verschil door afronding)');
// Elk officieel onderdeel zit in precies één groep op de site
const gebruikt = [].concat(...D.GROEPEN.map((g) => g.delen)).sort().join(',');
const bestaand = D.UITGAVEN.map((u) => u.id).sort().join(',');
if (gebruikt !== bestaand) { fout++; console.log('FOUT groepen en onderdelen komen niet overeen'); }
else console.log('OK   Elk onderdeel zit in precies één groep');
// De genoemde inkomstenposten zijn samen niet hoger dan het totaal
if (som(D.INKOMSTEN) > D.INKOMSTEN_TOTAAL) { fout++; console.log('FOUT inkomstenposten zijn samen hoger dan het totaal'); }
else console.log('OK   Inkomstenposten passen binnen het totaal');
// Elke rij in de 2027-tabel met een bron verwijst naar een bestaande link
for (const r of D.PLANNEN) if (r.bron && !D.BRON[r.bron]) { fout++; console.log('FOUT onbekende bron bij: ' + r.wat); }
// De leesbare bestanden in data/ lopen gelijk met de cijfers op de site
const uit = require('child_process').spawnSync(process.execPath, [require('path').join(__dirname, 'tools', 'exporteer-data.js'), '--controle'], { encoding: 'utf8' });
process.stdout.write(uit.stdout);
if (uit.status !== 0) fout++;

console.log(fout ? fout + ' fout(en)' : 'Alle controles geslaagd');
process.exit(fout ? 1 : 0);
