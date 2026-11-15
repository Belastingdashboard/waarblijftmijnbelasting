// Schrijft de cijfers uit landen/belgie/regels.js, landen/belgie/data.js en landen/nederland/data.js weg als leesbare JSON
// in buitenland/landen/<land>/data/. Zelfde opzet als tools/exporteer-data.js voor Nederland.
// Starten met: node buitenland/tools/exporteer-data.js   (controleren zonder te schrijven: voeg --controle toe)
(function (root) {
  'use strict';
  var node = typeof module !== 'undefined' && module.exports;
  var R = node ? require('../landen/belgie/regels.js') : root.RegelsBelgie;
  var D = node ? require('../landen/belgie/data.js') : root.DataBelgie;
  var N = node ? require('../landen/nederland/data.js') : root.DataNederland;

  // Uitgaven en inkomsten van één land, voor beide landen in dezelfde vorm
  function uitgaven(code, naam, d, bronInwoners, extra) {
    var o = {
      beschrijving: naam + ': uitgaven en inkomsten van de gezamenlijke overheid, en het aantal inwoners.',
      land: code,
      jaarVanDeCijfers: d.JAAR_CIJFERS,
      gecontroleerdOp: R.GECONTROLEERD_OP,
      letOp: 'Gerealiseerde cijfers over ' + d.JAAR_CIJFERS + ' van de hele overheid samen (Eurostat), voor beide landen uit dezelfde tabellen. '
        + (code === 'belgie' ? 'De Belgische cijfers zijn voorlopig. ' : 'De Nederlandse site zelf gebruikt de rijksbegroting 2026; die cijfers staan in data/2026/rijksuitgaven.json. ')
        + 'Zie landen/belgie/OPEN-PUNTEN.md, deel A.',
      eenheden: 'mld = miljard euro.',
      inwoners: { aantal: d.INWONERS, peildatum: '2026-01-01', bron: bronInwoners },
      uitgaven: { totaalMld: d.UITGAVEN_TOTAAL, bron: d.BRON.eurostatCofog, onderdelen: d.UITGAVEN },
      groepenOpDeSite: {
        opmerking: 'Eigen indeling: officiële onderdelen samengevoegd tot begrijpelijke groepen. "delen" verwijst naar de id van de onderdelen hierboven.',
        groepen: d.GROEPEN
      },
      inkomsten: {
        totaalMld: d.INKOMSTEN_TOTAAL,
        opmerking: 'Totaal uit gov_10a_main, posten uit gov_10a_taxag. De rest is "overige inkomsten": het totaal min de genoemde posten.',
        bron: d.BRON.eurostatHoofdcijfers,
        bronPosten: d.BRON.eurostatBelastingen,
        posten: d.INKOMSTEN
      }
    };
    for (var k in extra) o[k] = extra[k];
    return o;
  }

  function bestanden() {
    return {
      'landen/belgie/data/2026/belastingregels.json': {
        beschrijving: 'België: tarieven, bijdragen en bedragen voor inkomstenjaar 2026 (aanslagjaar 2027), zoals het rekenmodel ze gebruikt.',
        land: 'belgie',
        jaar: 2026,
        gecontroleerdOp: R.GECONTROLEERD_OP,
        status: 'Werk in uitvoering. Overgenomen door een AI-assistent, nog niet door een mens nagekeken. Zie OPEN-PUNTEN.md.',
        eenheden: 'Bedragen in euro per jaar, tenzij de naam of de toelichting iets anders zegt. Percentages als breuk (0.25 = 25%). null = niet bekend of verschilt per persoon.',
        toelichting: {
          schijven: 'Personenbelasting: rijen van [ondergrens van de schijf, tarief].',
          bvsKinderen: 'Verhoging van de belastingvrije som bij 0, 1, 2, 3 en 4 kinderen ten laste; daarboven bvsPerExtraKind per kind.',
          werkbonus: 'Sociale werkbonus voor bedienden per periode van 2026. a (luik A) en b (luik B): [maximum per maand, maandloon tot waar het maximum geldt, afbouw per euro, maandloon waarboven 0].',
          bbszAlleen: 'Bijzondere bijdrage sociale zekerheid, individuele aanslag: rijen van [maandloon meer dan, bedrag per kwartaal aan de voet, percentage over het meerdere maandloon]. Bedragen per kwartaal.',
          bbszSamen: 'Zelfde bijdrage bij een gemeenschappelijke aanslag.',
          gemeentebelasting: 'Verschilt per gemeente; de bezoeker vult het tarief in.',
          zelfstandige: 'Sociale bijdragen zelfstandigen in hoofdberoep, zonder beheerskosten van het sociaal verzekeringsfonds.',
          kinderbijslag: 'Alleen het Vlaams Groeipakket voor kinderen geboren sinds 2019. Andere gewesten: null.'
        },
        regels: R.P2026,
        bronnen: R.BRONNEN
      },
      'landen/belgie/data/2026/overheidsuitgaven.json': uitgaven('belgie', 'België', D, D.BRON.statbelBevolking, { kostenPerPersoon: D.KOSTEN, plannen2027: D.PLANNEN }),
      'landen/nederland/data/2026/overheidsuitgaven.json': uitgaven('nederland', 'Nederland', N, N.BRON.cbsBevolking, {})
    };
  }

  if (!node) { root.ExportBuitenland = { bestanden: bestanden }; return; }
  var fs = require('fs'), path = require('path');
  var alleenControle = process.argv.indexOf('--controle') >= 0, verschil = 0, b = bestanden();
  Object.keys(b).forEach(function (naam) {
    var pad = path.join(__dirname, '..', naam), tekst = JSON.stringify(b[naam], null, 2) + '\n';
    if (alleenControle) {
      var nu = fs.existsSync(pad) ? fs.readFileSync(pad, 'utf8') : '';
      if (nu !== tekst) { verschil++; console.log('FOUT buitenland/' + naam + ' loopt niet gelijk met de cijfers. Draai: node buitenland/tools/exporteer-data.js'); }
      else console.log('OK   buitenland/' + naam + ' is gelijk aan de cijfers');
    } else {
      fs.mkdirSync(path.dirname(pad), { recursive: true });
      fs.writeFileSync(pad, tekst);
      console.log('Geschreven: buitenland/' + naam);
    }
  });
  process.exit(verschil ? 1 : 0);
})(typeof window !== 'undefined' ? window : this);
