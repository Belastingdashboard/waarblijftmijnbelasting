/*
 * België: tarieven, bijdragen en bedragen voor inkomstenjaar 2026 (aanslagjaar 2027).
 * Alle cijfers zijn overgenomen uit de genoemde bron (zie BRONNEN onderaan).
 * Er staan geen geschatte cijfers in dit bestand. Wat niet bekend is, staat op null.
 * Onzekerheden en aannames staan in OPEN-PUNTEN.md in deze map.
 */
(function (root) {
  'use strict';

  var P2026 = {
    land: 'belgie',
    jaar: 2026,
    aanslagjaar: 2027,

    // Personenbelasting: [ondergrens van de schijf, tarief] (FOD Financiën, Belastingtarieven)
    schijven: [[0, 0.25], [16720, 0.40], [29510, 0.45], [51070, 0.50]],

    // Belastingvrije som (FOD Financiën, Belastingtarieven en Kinderen ten laste)
    belastingvrijeSom: 11550,
    // Verhoging voor 1, 2, 3 en 4 kinderen ten laste; daarboven per extra kind
    bvsKinderen: [0, 2030, 5230, 11720, 18970],
    bvsPerExtraKind: 7240,
    bvsAlleenstaandeMetKinderen: 2030,
    // Bijkomende verhoging per kind jonger dan 3 jaar zonder aftrek van opvangkosten.
    // Staat hier ter informatie; het model rekent er niet mee (leeftijd onder 3 wordt niet gevraagd).
    bvsKindJongerDan3: 760,
    // Terugbetaalbaar belastingkrediet voor kinderen ten laste: maximum per kind
    kredietPerKind: 550,

    // Forfaitaire beroepskosten werknemers (FOD Financiën, Beroepsinkomen)
    forfaitPct: 0.30,
    forfaitMax: 6070,

    // Gemeentebelasting: verschilt per gemeente. Er is geen landelijk tarief; de bezoeker vult het in.
    gemeentebelasting: null,

    // Werknemersbijdrage sociale zekerheid (RSZ, De bijdragen)
    rszWerknemer: 0.1307,
    rszOpbouw: { pensioenen: 0.0750, geneeskundigeVerzorging: 0.0355, ziekteUitkeringen: 0.0115, werkloosheid: 0.0087 },

    // Sociale werkbonus voor bedienden (RSZ, Werkbonus). Per periode van 2026:
    // maanden = kalendermaanden waarin de tabel geldt.
    // a en b = [maximumbedrag per maand, loon tot waar het maximum geldt, afbouw per euro, loon waarboven 0]
    werkbonus: [
      { maanden: [1, 2],          a: [123.00, 2833.36, 0.2807, 3271.48], b: [165.87, 2218.73, 0.2699, 2833.36] },
      { maanden: [3],             a: [123.00, 2833.36, 0.2442, 3336.98], b: [165.87, 2218.73, 0.2699, 2833.36] },
      { maanden: [4, 5, 6],       a: [125.04, 2880.32, 0.2738, 3336.98], b: [168.62, 2255.50, 0.2699, 2880.32] },
      { maanden: [7, 8],          a: [127.54, 2937.93, 0.3196, 3336.98], b: [171.99, 2300.62, 0.2699, 2937.93] },
      // Oktober tot en met december: de instructies voor het 4e kwartaal waren op 14-11-2026 niet gepubliceerd.
      // Het model gebruikt de tabel van 1 september (zie OPEN-PUNTEN.md, punt B3).
      { maanden: [9, 10, 11, 12], a: [127.54, 2937.93, 0.2739, 3403.62], b: [171.99, 2300.62, 0.2699, 2937.93] }
    ],
    werkbonusJaarMax: 3594.36,

    // Fiscale werkbonus: deel van de sociale werkbonus dat je als belastingkrediet krijgt
    // (circulaire 2026/C/89 van FOD Financiën; niet op de officiële site zelf nagelezen, zie OPEN-PUNTEN.md, punt B4)
    fiscaleWerkbonusA: 0.3314,
    fiscaleWerkbonusB: 0.63,
    fiscaleWerkbonusMax: 2000,

    // Bijzondere bijdrage voor de sociale zekerheid, individuele aanslag (RSZ).
    // Rijen: [maandloon meer dan, bedrag per kwartaal aan de voet, percentage over het meerdere maandloon]
    bbszAlleen: [[1945.38, 0, 0.0422], [2190.18, 30.99, 0.0110], [3737.00, 82.05, 0.0338], [4100.00, 118.83, 0.0110]],
    bbszAlleenMax: 182.82,
    // Gemeenschappelijke aanslag, partner met beroepsinkomen
    bbszSamenVast: 15.45,          // per kwartaal, kwartaalloon vanaf bbszSamenVastVanaf tot 3 x 1.945,38
    bbszSamenVastVanaf: 3285.29,   // kwartaalloon
    bbszSamen: [[1945.38, 0, 0.0590], [2190.18, 43.32, 0.0110]],
    bbszSamenMax: 154.92,
    // Gemeenschappelijke aanslag, partner zonder beroepsinkomen: zelfde rijen, ander maximum
    bbszSamenEenInkomenMax: 182.82,

    // Werkgever, privésector, werknemers die onder alle regelingen vallen (RSZ, De bijdragen)
    werkgeverBasis: 0.1988,
    werkgeverLoonmatiging: 0.0512,

    // Zelfstandigen in hoofdberoep (FOD Sociale Zekerheid / RSVZ, Sociale bijdragen 2026, zonder beheerskosten)
    zelfstandige: {
      pct1: 0.2050, grens1: 75024.54,
      pct2: 0.1416, grens2: 110562.42,
      minInkomen: 17374.08, minInkomenPrimostarter: 8972.07,
      minPerKwartaal: 890.42, minPerKwartaalPrimostarter: 459.82, maxPerKwartaal: 5103.05,
      // Vanaf de wettelijke pensioenleeftijd met een rustpensioen
      pensioen: { vrijTot: 3844.32, pct1: 0.1470, pct2: 0.1416, minPerKwartaal: 141.28, maxPerKwartaal: 4015.19 }
    },

    // Kinderbijslag. Verschilt per gewest; alleen het Vlaams Groeipakket is overgenomen.
    kinderbijslag: {
      vlaanderen: {
        // Kinderen geboren sinds 1 januari 2019, bedrag per maand (stand 1 september 2026)
        basisbedragPerMaand: 190.66,
        // Schoolbonus per jaar, naar leeftijd. Ter informatie; het model rekent er niet mee.
        schoolbonus: { k0tot4: 23.82, k5tot11: 41.70, k12tot17: 59.57 }
      },
      wallonie: null,
      brussel: null,
      duitstalig: null
    }
  };

  // Alleen voor de controle tegen het officiële rekenvoorbeeld van FOD Financiën (inkomstenjaar 2025)
  var P2025 = {
    land: 'belgie', jaar: 2025, aanslagjaar: 2026,
    schijven: [[0, 0.25], [16320, 0.40], [28800, 0.45], [49840, 0.50]],
    belastingvrijeSom: 10910,
    bvsKinderen: [0, 1980, 5110, 11440, 18510], bvsPerExtraKind: 7070, bvsAlleenstaandeMetKinderen: 1980,
    forfaitPct: 0.30, forfaitMax: 5930
  };

  var BRONNEN = {
    tarieven: 'https://fin.belgium.be/nl/particulieren/belastingaangifte/inkomsten/belastingtarieven',
    beroepskosten: 'https://fin.belgium.be/nl/particulieren/belastingaangifte/inkomsten/beroepsinkomen',
    kinderenTenLaste: 'https://fin.belgium.be/nl/particulieren/belastingaangifte/persoonlijke-situatie/personen-ten-laste/kinderen',
    huwelijkSamenwonen: 'https://fin.belgium.be/nl/particulieren/belastingaangifte/persoonlijke-situatie/huwelijk-samenwonen',
    gemeentebelasting: 'https://fin.belgium.be/nl/particulieren/belastingaangifte/aanslagbiljet/gemeentebelasting',
    rszBijdragen: 'https://www.socialsecurity.be/employer/instructions/dmfa/nl/latest/instructions/socialsecuritycontributions/contributions.html',
    werkbonus: 'https://www.socialsecurity.be/employer/instructions/dmfa/nl/latest/instructions/deductions/workers_reductions/workbonus.html',
    werkbonusKwartaal1: 'https://www.socialsecurity.be/employer/instructions/dmfa/nl/2026-1/instructions/deductions/workers_reductions/workbonus.html',
    werkbonusKwartaal2: 'https://www.socialsecurity.be/employer/instructions/dmfa/nl/2026-2/instructions/deductions/workers_reductions/workbonus.html',
    fiscaleWerkbonus: 'https://blog.forumforthefuture.be/nl/article/circulaire-2026c89-over-de-verhoging-van-de-fiscale-werkbonus/32703',
    bbsz: 'https://www.socialsecurity.be/employer/instructions/dmfa/nl/latest/instructions/special_contributions/other_specialcontributions/specialsocialsecuritycontribution.html',
    zelfstandigen: 'https://socialsecurity.belgium.be/sites/default/files/content/docs/nl/sociaal-beleid-vorm-geven/zelfstandigen/bijdragennota_2026_tabel_nl.pdf',
    groeipakket: 'https://www.vlaanderen.be/vlaams-groeipakket/bedragen-en-betaaldata'
  };

  var api = { P2026: P2026, P2025: P2025, BRONNEN: BRONNEN, GECONTROLEERD_OP: '2026-11-14' };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.RegelsBelgie = api;
})(typeof window !== 'undefined' ? window : this);
