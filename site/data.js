/*
 * Overheidsuitgaven, inkomsten en 2027-voorstellen.
 * Alle cijfers zijn overgenomen uit de genoemde bron. null = niet gevonden in een officiële bron.
 */
(function (root) {
  'use strict';

  var BRON = {
    mn2026: 'https://www.rijksoverheid.nl/binaries/rijksoverheid/documenten/begrotingen/2025/09/16/samenvatting-miljoenennota-2026/visuele-samenvatting-miljoenennota-2026.pdf',
    mn2027: 'https://www.rijksfinancien.nl/miljoenennota/2027/bijlage',
    cbsBevolking: 'https://opendata.cbs.nl/statline/#/CBS/nl/dataset/82905NED',
    cbsZorg: 'https://opendata.cbs.nl/statline/#/CBS/nl/dataset/85660NED',
    ocw: 'https://www.rijksfinancien.nl/memorie-van-toelichting/2027/OWB/VIII',
    szw: 'https://www.rijksfinancien.nl/memorie-van-toelichting/2027/OWB/XV',
    vws: 'https://www.rijksfinancien.nl/memorie-van-toelichting/2027/OWB/XVI',
    svbAow: 'https://www.svb.nl/nl/aow/bedragen-aow/aow-bedragen',
    sleuteltabel2027: 'https://www.rijksfinancien.nl/sites/default/files/bestanden/belastingplan-2027/pakket-belastingplan-2027/Fiscale-sleuteltabel-2027-incl-correctie-tarieven-energiebelasting-zelfstandigenaftrek.pdf',
    meijburg: 'https://www.meijburg.nl/nieuws/pakket-belastingplan-2027-en-novelle-uitbreiding-vermogenswinstbelasting-box-3-aangenomen',
    eersteKamer: 'https://www.eerstekamer.nl/wetsvoorstel/37022_belastingplan_2027',
    zvw2027: 'https://www.taxlive.nl/nl/documenten/vn-vandaag/bedragen-en-percentages-inkomensafhankelijke-bijdragen-2027-vastgesteld/',
    vermogensgrens2027: 'https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/berichten/nieuws/toeslagen/lagere-vermogensgrenzen-zorgtoeslag-kindgebonden-budget-vanaf-1-januari-2027',
    sra: 'https://www.sra.nl/nieuws/000000/2026/11/belastingplannen-2027-wat-staat-nog-overeind-in-de-inkomstenbelasting',
    zorgwijzer: 'https://www.zorgwijzer.nl/zorgverzekering-2027/eigen-risico-definitief-naar-e-400-dit-ligt-nu-vast-voor-2027-en-dit-nog-niet'
  };

  // Inwoners op 1 januari 2026 (CBS, tabel 82905NED)
  var INWONERS = 18130208;

  // Rijksuitgaven 2026 per thema, miljard euro (Miljoenennota 2026, visuele samenvatting)
  var UITGAVEN = [
    { id: 'sociaal', naam: 'Sociale zekerheid en arbeidsmarkt', mld: 124.7,
      uitleg: 'AOW, arbeidsongeschiktheid, WW, bijstand, kinderbijslag, kindgebonden budget en kinderopvangtoeslag.' },
    { id: 'zorg', naam: 'Zorg', mld: 119.5,
      uitleg: 'Huisarts, ziekenhuis, medicijnen, verpleeghuizen en de zorgtoeslag.' },
    { id: 'gemeenten', naam: 'Gemeenten en provincies', mld: 56.6,
      uitleg: 'Gemeentefonds, Provinciefonds en Btw-compensatiefonds. Hieruit betalen gemeenten onder meer jeugdzorg, hulp thuis (Wmo), lokale wegen, sport en cultuur.' },
    { id: 'onderwijs', naam: 'Onderwijs, cultuur en wetenschap', mld: 54.8,
      uitleg: 'Basisscholen, middelbare scholen, mbo, hbo, universiteiten, studiefinanciering en cultuur.' },
    { id: 'defensie', naam: 'Defensie', mld: 34.5, uitleg: 'Krijgsmacht en materieel.' },
    { id: 'justitie', naam: 'Justitie en veiligheid', mld: 16.8,
      uitleg: 'Politie, rechtspraak en gevangenissen.' },
    { id: 'buitenland', naam: 'Buitenlandse zaken en ontwikkelingshulp', mld: 15.5,
      uitleg: 'Ambassades, afdrachten aan de Europese Unie en ontwikkelingssamenwerking.' },
    { id: 'infra', naam: 'Infrastructuur en waterstaat', mld: 14.9,
      uitleg: 'Rijkswegen, spoor, dijken en waterbeheer.' },
    { id: 'rente', naam: 'Rente op de staatsschuld', mld: 9.5, uitleg: 'Rentelasten van de staat.' },
    { id: 'asiel', naam: 'Asiel en migratie', mld: 8.9, uitleg: 'Opvang, asielprocedures en migratiebeleid.' },
    { id: 'wonen', naam: 'Volkshuisvesting en ruimtelijke ordening', mld: 8.8,
      uitleg: 'Woningbouw, ruimtelijke ordening en de huurtoeslag.' },
    { id: 'landbouw', naam: 'Landbouw, visserij, voedselzekerheid en natuur', mld: 4.2, uitleg: '' },
    { id: 'klimaat', naam: 'Klimaat en groene groei', mld: 4.1, uitleg: '' },
    { id: 'financien', naam: 'Financiën', mld: 3.5, uitleg: 'Onder meer de Belastingdienst.' },
    { id: 'bzk', naam: 'Binnenlandse zaken en Koninkrijksrelaties', mld: 3.0, uitleg: '' },
    { id: 'ez', naam: 'Economische zaken', mld: 2.9, uitleg: '' },
    { id: 'overig', naam: 'Overig', mld: 4.2, uitleg: '' }
  ];


  // Dezelfde uitgaven, samengevoegd tot begrijpelijke groepen. 'delen' verwijst naar de officiële onderdelen hierboven.
  var GROEPEN = [
    { id: 'zorg', naam: 'Zorg', delen: ['zorg'],
      uitleg: 'De huisarts, het ziekenhuis, medicijnen en het verpleeghuis.' },
    { id: 'sociaal', naam: 'AOW en vangnet', delen: ['sociaal'],
      uitleg: 'AOW als je oud bent. Geld als je ziek wordt of je baan verliest. En kinderbijslag.' },
    { id: 'gemeenten', naam: 'Je gemeente', delen: ['gemeenten'],
      uitleg: 'Jeugdzorg, hulp thuis, straten, sportvelden en de bibliotheek.' },
    { id: 'onderwijs', naam: 'School en studie', delen: ['onderwijs'],
      uitleg: 'De basisschool, de middelbare school, mbo, hbo en universiteit.' },
    { id: 'veiligheid', naam: 'Veiligheid', delen: ['defensie', 'justitie'],
      uitleg: 'Het leger, de politie, rechters en gevangenissen.' },
    { id: 'buitenland', naam: 'Buitenland en Europa', delen: ['buitenland'],
      uitleg: 'Wat Nederland aan de Europese Unie betaalt, ambassades en ontwikkelingshulp.' },
    { id: 'infra', naam: 'Wegen, spoor en dijken', delen: ['infra'],
      uitleg: 'Snelwegen, treinsporen en bescherming tegen het water.' },
    { id: 'rente', naam: 'Rente op schulden', delen: ['rente'],
      uitleg: 'De rente die Nederland betaalt over geleend geld.' },
    { id: 'asiel', naam: 'Asiel en migratie', delen: ['asiel'],
      uitleg: 'Opvang van asielzoekers en het behandelen van aanvragen.' },
    { id: 'wonen', naam: 'Wonen', delen: ['wonen'],
      uitleg: 'Huurtoeslag en het bouwen van woningen.' },
    { id: 'rest', naam: 'Al het andere', delen: ['landbouw', 'klimaat', 'financien', 'bzk', 'ez', 'overig'],
      uitleg: 'Landbouw en natuur, klimaat, de Belastingdienst en de rest van de overheid.' }
  ];

  // Officieel totaal volgens dezelfde bron (de afgeronde onderdelen tellen op tot 486,4)
  var UITGAVEN_TOTAAL = 486.3;

  // Inkomsten 2026, miljard euro (Miljoenennota 2026). 'Overige' is afgeleid: totaal min de genoemde posten.
  var INKOMSTEN_TOTAAL = 451.4;
  var INKOMSTEN = [
    { naam: 'Loon- en inkomstenbelasting', mld: 110.3 },
    { naam: 'Btw', mld: 87.8 },
    { naam: 'Zorgpremies', mld: 61.4 },
    { naam: 'Winstbelasting bedrijven (vennootschapsbelasting)', mld: 49.7 },
    { naam: 'Premies volksverzekeringen (AOW, Anw, Wlz)', mld: 44.9 },
    { naam: 'Premies werknemersverzekeringen (WW, WIA)', mld: 43.5 },
    { naam: 'Accijnzen', mld: 11.5 }
  ];

  // Eenheidskosten uit officiële bronnen
  var KOSTEN = {
    // Gemiddelde kosten basisverzekering per persoon per jaar naar leeftijd (CBS 85660NED, 2024, voorlopig)
    zorg: { k0tot20: 1630, gemiddeld: 3263, k60tot80: 5326 },
    // Rijksbekostiging per leerling 2026 (OCW-begroting 2027)
    onderwijs: { primair: 11500, voortgezet: 13700, mbo: 12400 },
    // AOW bruto per maand vanaf 1 juli 2026, inclusief vakantiegeld (SVB)
    aow: { alleenstaand: 1662.16 + 104.78, samenwonend: 1139.39 + 74.85 },
    // Wat een volwassene in 2026 gemiddeld betaalt aan collectief gefinancierde zorg (VWS-begroting 2027)
    zorgCollectiefPerVolwassene: 7369
  };

  // Voorstellen voor 2027. status: 'vast' | 'tk' | 'voorstel' | 'raming' | 'onbekend'
  var PLANNEN = [
    { wat: 'Tarief eerste schijf', nu: '35,75%', straks: '35,84%', status: 'tk', bron: 'meijburg' },
    { wat: 'Tarief tweede schijf', nu: '37,56%', straks: '38,02%', status: 'tk', bron: 'meijburg' },
    { wat: 'Toptarief', nu: '49,50%', straks: '49,50%', status: 'tk', bron: 'sleuteltabel2027' },
    { wat: 'Toptarief geldt vanaf', nu: '€ 78.426', straks: '€ 80.578 of € 80.819', status: 'tk', bron: 'meijburg',
      noot: 'Twee vakbronnen noemen een verschillend bedrag; een officiële tabel na de amendementen is er nog niet.' },
    { wat: 'Algemene heffingskorting (maximum)', nu: '€ 3.115', straks: '€ 3.163', status: 'tk', bron: 'meijburg' },
    { wat: 'Arbeidskorting (maximum)', nu: '€ 5.685', straks: '€ 5.790', status: 'tk', bron: 'meijburg',
      noot: 'Alleen het maximum is bekend. De volledige tabel na de amendementen is niet gepubliceerd.' },
    { wat: 'Zelfstandigenaftrek', nu: '€ 1.200', straks: '€ 900', status: 'tk', bron: 'sleuteltabel2027' },
    { wat: 'Startersaftrek', nu: '€ 2.123', straks: '€ 10 (vervalt in 2028)', status: 'tk', bron: 'sra' },
    { wat: 'Mkb-winstvrijstelling', nu: '12,7%', straks: '12,7%', status: 'tk', bron: 'sleuteltabel2027' },
    { wat: 'Zvw-bijdrage ondernemers', nu: '4,85%', straks: '5,02%', status: 'vast', bron: 'zvw2027' },
    { wat: 'Zvw-heffing werkgevers', nu: '6,10%', straks: '6,27%', status: 'vast', bron: 'zvw2027' },
    { wat: 'Eigen risico zorgverzekering', nu: '€ 385', straks: '€ 400', status: 'raming', bron: 'zorgwijzer',
      noot: 'Gemeld door Zorgwijzer; de ministeriële regeling zelf is niet gecontroleerd.' },
    { wat: 'Gemiddelde zorgpremie per jaar', nu: '€ 1.884', straks: '€ 2.029', status: 'raming', bron: 'vws' },
    { wat: 'Zorgtoeslag alleenstaande (maximum per jaar)', nu: '€ 1.550', straks: '€ 1.680', status: 'raming', bron: 'vws' },
    { wat: 'Vermogensgrens zorgtoeslag (alleenstaande)', nu: '€ 146.011', straks: '€ 119.122', status: 'vast', bron: 'vermogensgrens2027' },
    { wat: 'Kinderbijslag', nu: 'zie berekening', straks: 'ongeveer € 90 per kind per jaar erbij', status: 'voorstel', bron: 'eersteKamer',
      noot: 'Wetsvoorstel 36923 is nog niet door de Tweede Kamer. Exacte bedragen zijn niet gevonden.' },
    { wat: 'Kindgebonden budget', nu: 'zie berekening', straks: 'snellere afbouw bij hoger inkomen', status: 'voorstel', bron: 'eersteKamer',
      noot: 'Bedragen en percentages voor 2027 zijn niet gevonden.' },
    { wat: 'Huurtoeslag', nu: 'zie berekening', straks: null, status: 'onbekend' }
  ];

  var api = { BRON: BRON, INWONERS: INWONERS, UITGAVEN: UITGAVEN, GROEPEN: GROEPEN, UITGAVEN_TOTAAL: UITGAVEN_TOTAAL, INKOMSTEN: INKOMSTEN,
              INKOMSTEN_TOTAAL: INKOMSTEN_TOTAAL, KOSTEN: KOSTEN, PLANNEN: PLANNEN };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Data = api;
})(typeof window !== 'undefined' ? window : this);
