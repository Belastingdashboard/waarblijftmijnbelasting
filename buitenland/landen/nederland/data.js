/*
 * Nederland op dezelfde basis als België: uitgaven en inkomsten van de hele overheid samen, volgens Eurostat.
 * Alleen voor de vergelijking met andere landen. De Nederlandse site zelf gebruikt de Miljoenennota (site/data.js).
 * Alle cijfers zijn overgenomen uit de genoemde bron. null = niet gevonden in een officiële bron.
 */
(function (root) {
  'use strict';
  var node = typeof module !== 'undefined' && module.exports;
  var SITE = node ? require('../../../site/data.js') : root.Data;
  var Belgie = node ? require('../belgie/data.js') : root.DataBelgie;

  var BRON = {
    eurostatCofog: 'https://ec.europa.eu/eurostat/databrowser/view/gov_10a_exp/default/table?lang=en',
    eurostatHoofdcijfers: 'https://ec.europa.eu/eurostat/databrowser/view/gov_10a_main/default/table?lang=en',
    eurostatBelastingen: 'https://ec.europa.eu/eurostat/databrowser/view/gov_10a_taxag/default/table?lang=en',
    cbsBevolking: SITE.BRON.cbsBevolking
  };

  // Jaar waarover de uitgaven en inkomsten gaan
  var JAAR_CIJFERS = 2024;

  // Inwoners op 1 januari 2026: hetzelfde cijfer als op de Nederlandse site (CBS)
  var INWONERS = SITE.INWONERS;

  // Uitgaven van de gezamenlijke overheid in 2024 naar functie (COFOG), miljard euro.
  // Eurostat, tabel gov_10a_exp, sector S13, totale uitgaven (TE), bijgewerkt 21-10-2026.
  var UITGAVEN = [
    { id: 'gf10', naam: 'Sociale bescherming', mld: 186.030,
      uitleg: 'AOW, uitkeringen bij ziekte, arbeidsongeschiktheid en werkloosheid, bijstand, kinderbijslag en toeslagen.' },
    { id: 'gf07', naam: 'Gezondheid', mld: 81.501,
      uitleg: 'Huisarts, ziekenhuis en medicijnen.' },
    { id: 'gf09', naam: 'Onderwijs', mld: 57.152,
      uitleg: 'Basisscholen, middelbare scholen, mbo, hbo en universiteiten.' },
    { id: 'gf04', naam: 'Economische zaken', mld: 49.487,
      uitleg: 'Wegen, spoor en openbaar vervoer, steun aan bedrijven, landbouw en energie.' },
    { id: 'gf01', naam: 'Algemeen overheidsbestuur', mld: 46.190,
      uitleg: 'Parlement, regering, Belastingdienst, bijdrage aan de Europese Unie en de rente op de staatsschuld.' },
    { id: 'gf03', naam: 'Openbare orde en veiligheid', mld: 21.598,
      uitleg: 'Politie, brandweer, rechtbanken en gevangenissen.' },
    { id: 'gf02', naam: 'Defensie', mld: 18.279, uitleg: 'Het leger en materieel.' },
    { id: 'gf05', naam: 'Milieubescherming', mld: 17.941,
      uitleg: 'Afval, afvalwater en natuur.' },
    { id: 'gf08', naam: 'Recreatie, cultuur en godsdienst', mld: 13.424,
      uitleg: 'Sport, cultuur en omroep.' },
    { id: 'gf06', naam: 'Huisvesting en gemeenschapsvoorzieningen', mld: 6.914,
      uitleg: 'Woningbouw, ruimtelijke ordening, watervoorziening en straatverlichting.' }
  ];

  // Officieel totaal volgens dezelfde tabel (COFOG, TOTAL).
  // De tabel met hoofdcijfers (gov_10a_main) noemt voor 2024 een totaal van 497,477 miljard; de tabellen zijn niet op hetzelfde moment bijgewerkt.
  var UITGAVEN_TOTAAL = 498.516;

  // Dezelfde groepen als bij België, zodat de landen naast elkaar kunnen staan
  var GROEPEN = Belgie.GROEPEN.map(function (g) {
    return { id: g.id, naam: g.id === 'sociaal' ? 'AOW en vangnet' : g.naam, delen: g.delen.slice(),
             uitleg: g.id === 'sociaal' ? 'AOW als je oud bent. Geld als je ziek wordt of je baan verliest. En kinderbijslag.'
                   : g.id === 'onderwijs' ? 'De basisschool, de middelbare school, mbo, hbo en universiteit.'
                   : g.id === 'wonen' ? 'Woningbouw en ruimtelijke ordening.' : g.uitleg };
  });

  // Inkomsten van de gezamenlijke overheid in 2024, miljard euro.
  // Totaal: Eurostat gov_10a_main (TR). Posten: Eurostat gov_10a_taxag. 'Overige' is afgeleid: totaal min de genoemde posten.
  var INKOMSTEN_TOTAAL = 489.402;
  var INKOMSTEN = [
    { naam: 'Belasting op inkomen van personen', mld: 109.881 },
    { naam: 'Btw', mld: 79.022 },
    { naam: 'Sociale bijdragen van werknemers en zelfstandigen', mld: 76.536 },
    { naam: 'Sociale bijdragen van werkgevers', mld: 58.353 },
    { naam: 'Winstbelasting bedrijven (vennootschapsbelasting)', mld: 48.078 },
    { naam: 'Accijnzen', mld: 14.103 }
  ];

  var api = { BRON: BRON, JAAR_CIJFERS: JAAR_CIJFERS, INWONERS: INWONERS, UITGAVEN: UITGAVEN, GROEPEN: GROEPEN,
              UITGAVEN_TOTAAL: UITGAVEN_TOTAAL, INKOMSTEN: INKOMSTEN, INKOMSTEN_TOTAAL: INKOMSTEN_TOTAAL };
  if (node) module.exports = api;
  else root.DataNederland = api;
})(typeof window !== 'undefined' ? window : this);
