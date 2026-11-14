// Schrijft de cijfers uit site/model.js en site/data.js weg als leesbare JSON in de map data/.
// De site zelf gebruikt de .js-bestanden; de JSON is bedoeld voor mensen, andere programma's en AI.
// Starten met: node tools/exporteer-data.js   (controleren zonder te schrijven: voeg --controle toe)
const fs = require('fs'), path = require('path');
const B = require('../site/model.js'), D = require('../site/data.js');
const PEILDATUM = '2026-11-14';
const bron = (sleutel) => D.BRON[sleutel] || null;

const bestanden = {
  'data/2026/belastingregels.json': {
    beschrijving: 'Tarieven, kortingen, premies en toeslagregels voor belastingjaar 2026, zoals het rekenmodel ze gebruikt.',
    jaar: 2026,
    gecontroleerdOp: PEILDATUM,
    eenheden: 'Bedragen in euro per jaar, tenzij de naam of de toelichting iets anders zegt. Percentages als breuk (0.3575 = 35,75%).',
    toelichting: {
      ak: 'Arbeidskorting: rijen van [ondergrens arbeidsinkomen, basisbedrag, percentage over het meerdere].',
      akAow: 'Arbeidskorting voor wie de AOW-leeftijd heeft.',
      kb: 'Kinderbijslag per kind per kwartaal: [1e en 2e kwartaal, 3e en 4e kwartaal].',
      ht: 'Huurtoeslag: bedragen per maand, ijkpunten per jaar.',
      zt: 'Zorgtoeslag: standaardpremie en inkomensgrenzen per jaar.',
      kgb: 'Kindgebonden budget: bedragen per jaar.'
    },
    regels: B.P2026,
    bronnen: B.BRONNEN
  },
  'data/2026/rijksuitgaven.json': {
    beschrijving: 'Uitgaven en inkomsten van het Rijk in 2026, het aantal inwoners en de kosten per persoon die de site gebruikt.',
    jaar: 2026,
    gecontroleerdOp: PEILDATUM,
    eenheden: 'mld = miljard euro. Kosten per persoon in euro.',
    inwoners: { aantal: D.INWONERS, peildatum: '2026-01-01', bron: bron('cbsBevolking') },
    uitgaven: {
      totaalMld: D.UITGAVEN_TOTAAL,
      opmerking: 'De onderdelen zijn in de bron afgerond op 0,1 miljard en tellen daardoor op tot 486,4.',
      bron: bron('mn2026'),
      onderdelen: D.UITGAVEN
    },
    groepenOpDeSite: {
      opmerking: 'Eigen indeling van de site: officiële onderdelen samengevoegd tot begrijpelijke groepen. "delen" verwijst naar de id van de onderdelen hierboven.',
      groepen: D.GROEPEN
    },
    inkomsten: {
      totaalMld: D.INKOMSTEN_TOTAAL,
      opmerking: 'De site toont daarnaast een post "Overige belastingen": het totaal min de genoemde posten.',
      bron: bron('mn2026'),
      posten: D.INKOMSTEN
    },
    kostenPerPersoon: {
      zorg: { waarden: D.KOSTEN.zorg, wat: 'Gemiddelde kosten basisverzekering per persoon per jaar naar leeftijd, 2024 (voorlopig).', bron: bron('cbsZorg') },
      onderwijs: { waarden: D.KOSTEN.onderwijs, wat: 'Rijksbekostiging per leerling per jaar, 2026.', bron: bron('ocw') },
      aow: { waarden: D.KOSTEN.aow, wat: 'AOW bruto per maand vanaf 1 juli 2026, inclusief vakantiegeld.', bron: bron('svbAow') },
      zorgCollectiefPerVolwassene: { waarde: D.KOSTEN.zorgCollectiefPerVolwassene, wat: 'Wat een volwassene in 2026 gemiddeld betaalt aan collectief gefinancierde zorg.', bron: bron('vws') }
    }
  },
  'data/2027/plannen.json': {
    beschrijving: 'Plannen voor 2027 naast de regels van 2026. De site rekent hier NIET mee; het is alleen een vergelijkingstabel.',
    gecontroleerdOp: PEILDATUM,
    statussen: {
      vast: 'Officieel vastgesteld.',
      tk: 'Aangenomen door de Tweede Kamer op 12 november 2026; de Eerste Kamer moet nog stemmen.',
      voorstel: 'Wetsvoorstel dat nog niet is aangenomen.',
      raming: 'Raming of bericht; nog niet definitief.',
      onbekend: 'Niet gevonden in een officiële bron.'
    },
    letOp: 'Een deel van deze rijen komt uit vakpublicaties en niet uit een officiële tabel, omdat die na de amendementen nog niet is gepubliceerd. Zie per rij het veld "bron" en "noot".',
    plannen: D.PLANNEN.map((r) => Object.assign({}, r, { bron: r.bron ? bron(r.bron) : null }))
  }
};

const alleenControle = process.argv.includes('--controle');
let verschil = 0;
for (const [naam, inhoud] of Object.entries(bestanden)) {
  const pad = path.join(__dirname, '..', naam), tekst = JSON.stringify(inhoud, null, 2) + '\n';
  if (alleenControle) {
    const nu = fs.existsSync(pad) ? fs.readFileSync(pad, 'utf8') : '';
    if (nu !== tekst) { verschil++; console.log('FOUT ' + naam + ' loopt niet gelijk met de site. Draai: node tools/exporteer-data.js'); }
    else console.log('OK   ' + naam + ' is gelijk aan de cijfers op de site');
  } else {
    fs.mkdirSync(path.dirname(pad), { recursive: true });
    fs.writeFileSync(pad, tekst);
    console.log('Geschreven: ' + naam);
  }
}
process.exit(verschil ? 1 : 0);
