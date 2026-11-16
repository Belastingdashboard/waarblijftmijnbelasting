/*
 * Lijst van landen voor de vergelijkingspagina (buitenland/vergelijken.html).
 * Een nieuw land toevoegen: maak de map landen/<land>/ (regels.js, model.js, data.js, test.js),
 * laad die bestanden in vergelijken.html en voeg hieronder één blok toe. De pagina zelf hoeft niet te veranderen.
 *
 * Per land:
 *   id, naam        de mapnaam en de naam op de pagina
 *   inHet           "in België", "in Nederland": voor zinnen op de pagina
 *   status          'af' of 'proef' (proef = nog niet door een mens nagekeken; de pagina waarschuwt dan)
 *   jaar            belastingjaar van het rekenmodel
 *   model           object met bereken(invoer); de uitkomst heeft minstens bruto, heffingTotaal, netto en som
 *   data            object met UITGAVEN, UITGAVEN_TOTAAL, GROEPEN, JAAR_CIJFERS en INWONERS (zelfde groepen in elk land)
 *   velden          extra vragen die alleen voor dit land gelden (zie België)
 *   nietMeegenomen  wat voor dit land altijd buiten de som blijft
 *   pakket          per soort werk: wat je in dit land wel of niet krijgt voor de belasting en bijdragen in de som.
 *                   Landen regelen zorg en pensioen verschillend; zonder deze uitleg lijkt het ene land te goedkoop.
 *   zorgDaarnaast   tekst voor de tabel: wat je in dit land naast de som nog zelf betaalt voor je zorgverzekering
 *   bronnen         [naam, link]
 */
(function (root) {
  'use strict';

  // Het Nederlandse model geeft geen kant-en-klare som. Dit maakt dezelfde rijen als de tabel op de hoofdpagina.
  function somNederland(r) {
    var p = root.Belasting.P2026, som = [], zzp = r.type === 'ondernemer';
    function rij(naam, bedrag, totaal) { som.push({ naam: naam, bedrag: bedrag, totaal: !!totaal }); }
    if (zzp) {
      rij('Winst (wat binnenkomt min je kosten)', r.winst);
      if (r.zelfstandigenaftrek) rij('Zelfstandigenaftrek', -r.zelfstandigenaftrek);
      if (r.startersaftrek) rij('Startersaftrek', -r.startersaftrek);
      rij('Mkb-winstvrijstelling (12,7%)', -r.mkbVrijstelling);
      rij('Hierover betaal je belasting', r.belastbaarInkomen, true);
    } else rij('Bruto salaris', r.bruto, true);
    rij('Belasting over de eerste € ' + String(p.schijf1Grens).replace(/\B(?=(\d{3})+$)/g, '.'), r.schijven.s1);
    if (r.schijven.s2) rij('Belasting schijf 2 (37,56%)', r.schijven.s2);
    if (r.schijven.s3) rij('Belasting daarboven (49,50%)', r.schijven.s3);
    if (r.tariefsaanpassing) rij('Minder aftrek bij hoog inkomen', r.tariefsaanpassing);
    rij('Korting voor iedereen (algemene heffingskorting)', -r.kortingen.algemeen);
    rij('Korting omdat je werkt (arbeidskorting)', -r.kortingen.arbeid);
    if (r.kortingen.combinatie) rij('Korting voor werkende ouders', -r.kortingen.combinatie);
    if (r.kortingen.ouderen) rij('Ouderenkorting', -r.kortingen.ouderen);
    if (r.kortingen.alleenstaandeOuderen) rij('Alleenstaandeouderenkorting', -r.kortingen.alleenstaandeOuderen);
    if (r.kortingen.totaal > r.kortingen.benut) rij('Korting die je niet kunt gebruiken', r.kortingen.totaal - r.kortingen.benut);
    rij('Belasting en premies', r.inkomstenbelasting, true);
    if (zzp) rij('Bijdrage zorgverzekering (4,85%)', r.zvwZelf);
    rij('Dit houd je over', r.netto, true);
    return som;
  }

  var B = root.RegelsBelgie.BRONNEN;
  function euro(x) { return '€ ' + String(Math.round(x)).replace(/\B(?=(\d{3})+$)/g, '.'); }
  var LANDEN = [
    {
      id: 'nederland', naam: 'Nederland', inHet: 'in Nederland', status: 'af', jaar: 2026,
      model: { bereken: function (invoer) { var r = root.Belasting.bereken(invoer); r.som = somNederland(r); return r; } },
      data: root.DataNederland,
      velden: [],
      nietMeegenomen: ['Je zorgpremie en eigen risico. Die betaal je aan je verzekeraar.',
        'Premie voor aanvullend pensioen via je werkgever. Die verschilt per pensioenfonds.'],
      pakket: {
        loondienst: 'In Nederland betaal je daarnaast zelf je zorgverzekering: gemiddeld ' + euro(root.Belasting.P2026.zorgpremieGemiddeld / 12)
          + ' per maand. Veel werknemers betalen ook premie voor aanvullend pensioen. Hoeveel dat is verschilt per pensioenfonds; dat weten we niet.',
        ondernemer: 'In Nederland betaal je daarnaast zelf je zorgverzekering: gemiddeld ' + euro(root.Belasting.P2026.zorgpremieGemiddeld / 12)
          + ' per maand. Pensioen en een verzekering tegen arbeidsongeschiktheid regel je als ondernemer zelf.'
      },
      zorgDaarnaast: euro(root.Belasting.P2026.zorgpremieGemiddeld / 12) + ' (gemiddeld)',
      bronnen: [
        ['Belastingdienst: tarieven 2026', root.Belasting.BRONNEN.loonheffingen],
        ['Rijksoverheid: premie zorgverzekering', root.Belasting.BRONNEN.zorgpremie],
        ['Eurostat: uitgaven van de overheid naar functie', root.DataNederland.BRON.eurostatCofog]
      ]
    },
    {
      id: 'belgie', naam: 'België', inHet: 'in België', status: 'proef', jaar: 2026,
      model: root.BelastingBelgie,
      data: root.DataBelgie,
      velden: [
        { id: 'gemeentebelasting', soort: 'getal', label: 'Gemeentebelasting in je gemeente (in %)', stap: 0.1,
          uitleg: 'Elke Belgische gemeente heeft een eigen tarief. Laat leeg als je het niet weet; dan telt deze belasting niet mee.',
          naar: function (v) { return v / 100; } },
        { id: 'gewest', soort: 'keuze', label: 'In welk gewest woon je?',
          uitleg: 'Nodig voor de kinderbijslag. Alleen Vlaanderen is opgenomen.',
          opties: [['', 'Niet ingevuld'], ['vlaanderen', 'Vlaanderen'], ['wallonie', 'Wallonië'], ['brussel', 'Brussel']] },
        { id: 'gehuwd', soort: 'vink', label: 'Ik ben gehuwd of woon wettelijk samen', alleenMet: 'partner',
          uitleg: 'Dan word je in België samen belast.' }
      ],
      pakket: {
        loondienst: 'In België zitten je wettelijk pensioen, de ziekteverzekering en de werkloosheidsverzekering in de bijdrage van 13,07% die van je loon afgaat.',
        ondernemer: 'In België zitten je wettelijk pensioen en de ziekteverzekering in je sociale bijdragen als zelfstandige.'
      },
      zorgDaarnaast: 'zit in de bijdragen',
      nietMeegenomen: [
        'Vakantiegeld en een dertiende maand. Die worden in België anders belast.',
        'Koophuis en huur. De regels verschillen per gewest.',
        'De bijdrage aan je ziekenfonds.'
      ],
      bronnen: [
        ['FOD Financiën: belastingtarieven', B.tarieven],
        ['FOD Financiën: beroepskosten', B.beroepskosten],
        ['FOD Financiën: kinderen ten laste', B.kinderenTenLaste],
        ['FOD Financiën: gemeentebelasting', B.gemeentebelasting],
        ['RSZ: bijdragen sociale zekerheid', B.rszBijdragen],
        ['RSZ: werkbonus', B.werkbonus],
        ['RSZ: bijzondere bijdrage sociale zekerheid', B.bbsz],
        ['FOD Sociale Zekerheid: bijdragen zelfstandigen', B.zelfstandigen],
        ['Vlaanderen: Groeipakket', B.groeipakket],
        ['Securex: minimumloon (geen officiële bron)', B.minimumloon],
        ['Statbel: aantal inwoners', root.DataBelgie.BRON.statbelBevolking],
        ['Eurostat: uitgaven van de overheid naar functie', root.DataBelgie.BRON.eurostatCofog]
      ]
    }
  ];

  root.Landen = { lijst: LANDEN, thuis: 'nederland',
    zoek: function (id) { for (var i = 0; i < LANDEN.length; i++) if (LANDEN[i].id === id) return LANDEN[i]; return null; } };
})(window);
