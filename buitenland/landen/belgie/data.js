/*
 * België: overheidsuitgaven, inkomsten en aantal inwoners. Zelfde opbouw als site/data.js.
 * Alle cijfers zijn overgenomen uit de genoemde bron. null = niet gevonden in een officiële bron.
 *
 * Let op (zie OPEN-PUNTEN.md, deel A):
 * - Het gaat om de hele overheid samen (federaal, gewesten en gemeenschappen, gemeenten, sociale zekerheid),
 *   niet alleen de federale begroting.
 * - Het zijn de gerealiseerde cijfers over 2024 (voorlopig), niet de begroting 2026.
 * - Voor de vergelijking staat Nederland op dezelfde basis in ../nederland/data.js.
 */
(function (root) {
  'use strict';

  var BRON = {
    eurostatCofog: 'https://ec.europa.eu/eurostat/databrowser/view/gov_10a_exp/default/table?lang=en',
    eurostatHoofdcijfers: 'https://ec.europa.eu/eurostat/databrowser/view/gov_10a_main/default/table?lang=en',
    eurostatBelastingen: 'https://ec.europa.eu/eurostat/databrowser/view/gov_10a_taxag/default/table?lang=en',
    statbelBevolking: 'https://statbel.fgov.be/nl/themas/bevolking/structuur-van-de-bevolking'
  };

  // Jaar waarover de uitgaven en inkomsten gaan
  var JAAR_CIJFERS = 2024;

  // Inwoners op 1 januari 2026 (Statbel, nieuwsbericht van 10 juni 2026)
  var INWONERS = 11867634;

  // Uitgaven van de gezamenlijke overheid in 2024 naar functie (COFOG), miljard euro.
  // Eurostat, tabel gov_10a_exp, sector S13, totale uitgaven (TE), voorlopige cijfers, bijgewerkt 21-10-2026.
  var UITGAVEN = [
    { id: 'gf10', naam: 'Sociale bescherming', mld: 126.5410,
      uitleg: 'Pensioenen, uitkeringen bij ziekte, invaliditeit en werkloosheid, kinderbijslag en leefloon.' },
    { id: 'gf07', naam: 'Gezondheid', mld: 49.5799,
      uitleg: 'Terugbetaling van dokter, ziekenhuis en medicijnen, en de ziekenhuizen zelf.' },
    { id: 'gf01', naam: 'Algemeen overheidsbestuur', mld: 44.3056,
      uitleg: 'Parlementen, regeringen, belastingdiensten, bijdrage aan de Europese Unie en de rente op de staatsschuld.' },
    { id: 'gf04', naam: 'Economische zaken', mld: 39.8542,
      uitleg: 'Wegen, spoor en openbaar vervoer, steun aan bedrijven, landbouw en energie.' },
    { id: 'gf09', naam: 'Onderwijs', mld: 39.2836,
      uitleg: 'Kleuterschool, lagere en middelbare school, hogescholen en universiteiten.' },
    { id: 'gf03', naam: 'Openbare orde en veiligheid', mld: 10.6477,
      uitleg: 'Politie, brandweer, rechtbanken en gevangenissen.' },
    { id: 'gf02', naam: 'Defensie', mld: 7.9464, uitleg: 'Het leger en materieel.' },
    { id: 'gf08', naam: 'Recreatie, cultuur en godsdienst', mld: 7.5520,
      uitleg: 'Sport, cultuur, omroep en erediensten.' },
    { id: 'gf05', naam: 'Milieubescherming', mld: 7.1761,
      uitleg: 'Afval, afvalwater en natuur.' },
    { id: 'gf06', naam: 'Huisvesting en gemeenschapsvoorzieningen', mld: 2.4014,
      uitleg: 'Sociale woningen, ruimtelijke ordening, watervoorziening en straatverlichting.' }
  ];

  // Officieel totaal volgens dezelfde tabel (COFOG, TOTAL)
  var UITGAVEN_TOTAAL = 335.2879;

  // Dezelfde uitgaven, samengevoegd tot begrijpelijke groepen. 'delen' verwijst naar de onderdelen hierboven.
  // Eigen indeling. ../nederland/data.js neemt deze groepen over, zodat de landen naast elkaar kunnen staan.
  var GROEPEN = [
    { id: 'sociaal', naam: 'Pensioen en vangnet', delen: ['gf10'],
      uitleg: 'Pensioen als je oud bent. Geld als je ziek wordt of je baan verliest. En kinderbijslag.' },
    { id: 'zorg', naam: 'Zorg', delen: ['gf07'],
      uitleg: 'De huisarts, het ziekenhuis en medicijnen.' },
    { id: 'bestuur', naam: 'Bestuur en rente op schulden', delen: ['gf01'],
      uitleg: 'Regeringen en parlementen, de belastingdienst, de bijdrage aan Europa en de rente op geleend geld.' },
    { id: 'economie', naam: 'Wegen, vervoer en economie', delen: ['gf04'],
      uitleg: 'Wegen, treinen, bussen en steun aan bedrijven en landbouw.' },
    { id: 'onderwijs', naam: 'School en studie', delen: ['gf09'],
      uitleg: 'De kleuterschool, de lagere en middelbare school, hogeschool en universiteit.' },
    { id: 'veiligheid', naam: 'Veiligheid', delen: ['gf02', 'gf03'],
      uitleg: 'Het leger, de politie, de brandweer, rechters en gevangenissen.' },
    { id: 'wonen', naam: 'Wonen', delen: ['gf06'],
      uitleg: 'Sociale woningen en ruimtelijke ordening.' },
    { id: 'rest', naam: 'Al het andere', delen: ['gf08', 'gf05'],
      uitleg: 'Sport en cultuur, afval en natuur.' }
  ];

  // Inkomsten van de gezamenlijke overheid in 2024, miljard euro.
  // Totaal: Eurostat gov_10a_main (TR). Posten: Eurostat gov_10a_taxag. 'Overige' is afgeleid: totaal min de genoemde posten.
  var INKOMSTEN_TOTAAL = 308.0883;
  var INKOMSTEN = [
    { naam: 'Belasting op inkomen van personen', mld: 74.2538 },
    { naam: 'Sociale bijdragen van werkgevers', mld: 48.5667 },
    { naam: 'Btw', mld: 37.8323 },
    { naam: 'Sociale bijdragen van werknemers en zelfstandigen', mld: 32.7187 },
    { naam: 'Winstbelasting bedrijven (vennootschapsbelasting)', mld: 27.0268 },
    { naam: 'Accijnzen', mld: 11.4336 }
  ];

  // Kosten per persoon voor "wat betaal je zelf". Voor België nog niet opgezocht in een officiële bron.
  var KOSTEN = {
    zorg: null,        // gemiddelde zorgkosten per persoon naar leeftijd
    onderwijs: null,   // kosten per leerling per onderwijsniveau
    pensioen: null     // wettelijk pensioen per maand (tegenhanger van de AOW)
  };

  // Plannen voor 2027: voor België nog niet opgezocht.
  var PLANNEN = [];

  var api = { BRON: BRON, JAAR_CIJFERS: JAAR_CIJFERS, INWONERS: INWONERS, UITGAVEN: UITGAVEN, GROEPEN: GROEPEN,
              UITGAVEN_TOTAAL: UITGAVEN_TOTAAL, INKOMSTEN: INKOMSTEN, INKOMSTEN_TOTAAL: INKOMSTEN_TOTAAL,
              KOSTEN: KOSTEN, PLANNEN: PLANNEN };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.DataBelgie = api;
})(typeof window !== 'undefined' ? window : this);
