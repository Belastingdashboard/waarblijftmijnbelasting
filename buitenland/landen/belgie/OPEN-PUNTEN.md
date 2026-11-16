# België: open punten, aannames en wat ontbreekt

Stand: 14 november 2026. Alle cijfers zijn door een AI-assistent (Claude Code) uit de genoemde bron overgenomen. **Geen enkel Belgisch cijfer is al door een mens nagekeken.**

Dit bestand heeft vier delen:

- **A. Beslissingen** die jullie moeten nemen voordat België op de site kan.
- **B. Cijfers die onzeker zijn** of niet uit een officiële bron zelf komen.
- **C. Aannames** in het rekenmodel.
- **D. Wat ontbreekt** en op `null` staat of niet wordt meegerekend.

Achteraan staat wat er in `site/` moet veranderen om België echt aan te sluiten.

## A. Beslissingen

### A1. Welke overheid en welk jaar voor "waar gaat elke € 100 heen"? (besloten op 15 november 2026)

Nederland gebruikt op de site de rijksbegroting 2026 (Miljoenennota). Voor België bestaat geen begroting die hetzelfde dekt: het geld loopt via de federale overheid, de sociale zekerheid, drie gewesten, drie gemeenschappen en de gemeenten, elk met een eigen begroting.

**Besluit.** Voor de vergelijking staan beide landen op dezelfde basis: de uitgaven van de hele overheid samen, naar functie (COFOG), over **2024**, uit dezelfde tabellen van Eurostat. Dat is het meest recente jaar met een verdeling. De Nederlandse cijfers hiervoor staan in `landen/nederland/data.js`.

| | Nederland | België |
|---|---|---|
| Uitgaven 2024 | 498,5 miljard euro | 335,3 miljard euro (voorlopig) |
| Inkomsten 2024 | 489,4 miljard euro | 308,1 miljard euro |
| Indeling | 10 functies volgens COFOG, 8 groepen | dezelfde |

**Wat dit betekent.**

- De vergelijking wijkt af van de Nederlandse hoofdpagina. Daar gaat het om het Rijk in 2026 (486,3 miljard euro, 11 groepen); in de vergelijking om alle overheden samen in 2024 (498,5 miljard euro, 8 groepen). Wie beide pagina's naast elkaar legt, ziet voor Nederland andere bedragen. Dat moet op de site worden uitgelegd.
- De hoofdpagina zelf is niet veranderd. Of die ook op Eurostat moet, is een aparte keuze.
- Bij Nederland noemen de twee Eurostat-tabellen een iets ander totaal voor de uitgaven in 2024: 498,516 miljard in de tabel naar functie en 497,477 miljard in de tabel met hoofdcijfers. Het model gebruikt de eerste, omdat de onderdelen daartoe optellen.

### A2. De groepen in de vergelijking zijn anders dan op de hoofdpagina

De groepen `gemeenten`, `buitenland`, `infra`, `rente` en `asiel` van de hoofdpagina bestaan in COFOG niet als aparte post. Rente en de bijdrage aan de Europese Unie zitten in "Algemeen overheidsbestuur". Asiel is niet apart te zien. De vergelijking heeft voor beide landen deze acht groepen: `sociaal`, `zorg`, `bestuur`, `economie`, `onderwijs`, `veiligheid`, `wonen` en `rest`.

Eurostat heeft een fijnere verdeling (bijvoorbeeld rente op de schuld apart). Die is niet overgenomen. Willen jullie rente apart, dan is dat één extra opvraging voor beide landen.

### A3. Gemeentebelasting

Elke Belgische gemeente heft een eigen percentage bovenop de personenbelasting. Er is geen landelijk tarief. FOD Financiën publiceert een lijst per gemeente (Excel); die is niet overgenomen.

**Wat er nu staat.** `gemeentebelasting` is een invoerveld. Is het leeg, dan is de uitkomst `null` en telt de belasting niet mee. Het model meldt dat dan.

**Opties.** De bezoeker het percentage laten invullen, de gemeente laten kiezen uit de officiële lijst, of een officieel gemiddelde zoeken. Dat gemiddelde is niet gevonden.

### A4. Gewest

Kinderbijslag, woonvoordelen en huurpremies verschillen per gewest. Het model vraagt daarom naar het gewest. Alleen Vlaanderen is deels ingevuld. Moet de site alle drie de gewesten aankunnen, of beginnen met Vlaanderen?

### A5. "Partner" betekent in België twee dingen

In Nederland telt samenwonen. In België maakt het uit of je gehuwd of wettelijk samenwonend bent (samen belast) of feitelijk samenwonend (apart belast). Het model heeft daarom een extra veld `gehuwd`. Staat dat uit, dan word je belast als alleenstaande, ook met een partner.

### A6. Vakantiegeld en dertiende maand

De Nederlandse site rekent met 12 keer het maandbedrag. Het Belgische model doet hetzelfde. In België zijn dubbel vakantiegeld en een eindejaarspremie heel gebruikelijk, en ze worden anders belast en anders meegeteld voor de werkbonus en de bijzondere bijdrage. Voor wie een netto maandbedrag invult, is de afwijking daardoor waarschijnlijk groter dan in Nederland.

### A7. Arbeider of bediende

Voor arbeiders rekent de RSZ met 108% van het loon en gelden andere werkbonusbedragen. Het model rekent iedereen als bediende. De arbeidersbedragen staan in dezelfde bron en zijn niet overgenomen.

## B. Cijfers die onzeker zijn

### B1. Niets is door een mens nagekeken

Zie bovenaan. De datum `gecontroleerdOp` is de dag waarop de AI het cijfer overnam.

### B2. Hoe de bronnen zijn gelezen

De sites van FOD Financiën en Statbel lieten zich niet automatisch ophalen. Die pagina's zijn in een browser geopend en daar gelezen. De tabellen met de werkbonus van januari tot en met juni 2026 zijn gelezen via een samenvatting van de pagina, niet letter voor letter. Ze zijn wel op samenhang gecontroleerd: het maximum gedeeld door de afbouw komt telkens uit op de bovengrens. De tabellen vanaf 1 juli en 1 september zijn letterlijk gelezen.

### B3. Werkbonus in oktober, november en december 2026

De RSZ-instructies voor het vierde kwartaal van 2026 waren nog niet gepubliceerd. Het model gebruikt voor die maanden de tabel van 1 september. Komt er nog een indexering, dan klopt dat niet meer.

### B4. Fiscale werkbonus: geen officiële bron gelezen

De percentages (33,14% voor luik A, 63% voor luik B) en het maximum van € 2.000 voor aanslagjaar 2027 komen uit circulaire 2026/C/89 van FOD Financiën, **gelezen via een weergave op een vakblog**. De circulaire zelf (Fisconetplus) is niet geopend. Ook is niet nagelezen of het krediet terugbetaalbaar is; het model gaat daarvan uit.

Dit punt weegt zwaar bij lage lonen. Bij een bruto jaarloon van € 24.000 met twee jonge kinderen komt het model op een netto bedrag dat **hoger is dan het bruto loon**: de werkbonus heft de hele bijdrage op en daar komen de fiscale werkbonus (€ 1.525) en het belastingkrediet voor kinderen (€ 352) bij. Dat moet iemand narekenen, bijvoorbeeld met Tax-Calc van FOD Financiën.

### B5. Werkgeversbijdrage

De basisbijdrage van 19,88% staat letterlijk in de RSZ-instructies. De 5,12% loonmatiging komt uit een samenvatting van dezelfde pagina; in de letterlijke tekst die is gelezen staat alleen de formule (5,67% plus 5,67% van de werkgeversbijdragen) en een maximum van 7,48% van vóór de verlaging. Samen 25%. Verminderingen voor de werkgever (structurele vermindering, doelgroepen) en andere bijdragen (vakantiegeld arbeiders, Fonds Sluiting Ondernemingen) zijn niet meegenomen.

### B6. Bijzondere bijdrage sociale zekerheid

De bron geeft bedragen per kwartaal en percentages over het maandloon. Het model rekent bij een vast maandloon: bedrag aan de voet plus het percentage keer het meerdere maandloon keer drie. Dat is een eigen lezing. Ze sluit op de schijfgrenzen aan op de bedragen in de bron, op 3 cent na bij € 4.100 (bron € 118,83, formule € 118,86).

De RSZ-bedragen zijn voorschotten. De definitieve bijdrage wordt bij de belastingaanslag berekend op het gezinsinkomen. Die eindafrekening is niet opgezocht; het model gebruikt de voorschotten.

### B7. Wet van 15 juli 2026 tot hervorming van de personenbelasting

Deze wet wijzigt de personenbelasting vanaf inkomstenjaar 2026. De belastingvrije som van € 11.550 en de fiscale werkbonus zijn daaruit overgenomen via de pagina's van FOD Financiën. De wet zelf is niet gelezen. Het is niet bekend of er nog andere wijzigingen voor 2026 in staan die het model raken.

### B8. Kinderbijslag (Groeipakket)

Het basisbedrag van € 190,66 per maand is het bedrag "sinds 1 september 2026". Het model rekent daar het hele jaar mee. Een eerdere officiële tabel (1 september 2025) noemt hetzelfde bedrag, maar die is alleen via een zoekresultaat gezien.

### B9. Uitgaven en inkomsten

De Belgische Eurostat-cijfers over 2024 zijn voorlopig en kunnen nog wijzigen. Het aantal inwoners is van 1 januari 2026; de uitgaven zijn van 2024. Een bedrag per inwoner mengt dus twee jaren.

### B10. Lonen onder het minimumloon (toegevoegd op 15 november 2026)

Het model rekent iedereen als voltijds werknemer (C6). Wie een jaarloon invult dat lager is dan het minimumloon voor een voltijdse baan, werkt in werkelijkheid deeltijd. De werkbonus wordt dan berekend op het voltijdse loon en daarna verminderd naar het aantal gewerkte uren. Het model deed dat niet en gaf daardoor een veel te hoge werkbonus. Dat was de oorzaak van het netto dat boven het bruto uitkwam (B4).

**Wat er nu gebeurt.** Ligt het maandloon onder het hoogste minimumloon van 2026 (€ 2.233,61 per maand, € 26.804 per jaar), dan zet het model `onbetrouwbaar` en toont de vergelijkingspagina voor België geen bedragen.

**Bron.** De bedragen van het minimumloon (GGMMI: € 2.154,11 van januari tot en met maart, € 2.189,81 van april tot en met juni, € 2.233,61 vanaf juli) komen van Securex, dat verwijst naar cao nr. 43 van de Nationale Arbeidsraad. **Geen officiële bron gelezen.** De exacte ingangsdata staan er niet bij.

**Echte oplossing.** Vragen hoeveel procent iemand werkt en de werkbonus volgens de RSZ-regels voor deeltijd berekenen. Die regels staan in dezelfde RSZ-instructies als de werkbonus en zijn niet overgenomen.

**Wat blijft.** Of de fiscale werkbonus wordt uitbetaald als er geen belasting meer verschuldigd is, is nog steeds niet in een officiële tekst nagelezen (B4). Net boven het minimumloon weegt dat nog mee.

### B11. De twee landen betalen niet voor hetzelfde (toegevoegd op 15 november 2026)

In België zitten het wettelijk pensioen, de ziekteverzekering en de werkloosheidsverzekering in de bijdrage van 13,07% die van het loon afgaat. In Nederland betaalt een werknemer de zorgpremie apart aan de verzekeraar en meestal premie voor aanvullend pensioen aan een pensioenfonds; de werknemersverzekeringen betaalt de werkgever. Geen van die Nederlandse bedragen zit in "belasting en bijdragen".

**Wat er nu gebeurt.** De kop van de vergelijking noemt alleen wat er in elk land van het loon afgaat, niet meer wie er meer overhoudt. Daaronder staat een blok "je krijgt er niet hetzelfde voor", en de tabel heeft een rij voor de zorgverzekering (Nederland: gemiddelde premie 2026 uit `site/model.js`; België: zit in de bijdragen).

**Wat ontbreekt.** De pensioenpremie in Nederland is onbekend; die verschilt per pensioenfonds. Ook het aanvullend pensioen in België, de ziekenfondsbijdrage en het eigen risico of remgeld zijn niet opgenomen. Een eerlijke vergelijking van wat iemand overhoudt is daardoor nog niet mogelijk.

## C. Aannames in het rekenmodel

| Nr | Aanname | Waarom |
|---|---|---|
| C1 | Bij een zelfstandige berekenen we de sociale bijdrage over de winst min die bijdrage zelf. | De bijdrage is aftrekbaar en wordt berekend over het netto inkomen. In het echt betaal je voorlopige bijdragen op het inkomen van drie jaar eerder, met later een afrekening. |
| C2 | De belasting over de belastingvrije som berekenen we met dezelfde schijven, van onderaf. | Het voorbeeld van FOD Financiën doet dat voor het basisbedrag (25%). Voor een verhoogde som die boven € 16.720 uitkomt is geen officieel voorbeeld gevonden. |
| C3 | Het belastingkrediet voor kinderen is het deel van de vrijstelling voor kinderen dat je niet kon gebruiken, tot € 550 per kind. | Eigen lezing van de tekst van FOD Financiën. Geen rekenvoorbeeld gevonden. |
| C4 | De gemeentebelasting rekenen we over de personenbelasting vóór aftrek van de terugbetaalbare kredieten. | Niet in een officiële bron nagelezen. |
| C5 | Alle kinderen zijn ten laste van de invuller. Zonder partner krijg je de verhoging voor alleenstaanden. | Bij samenwonenden mag maar één van beiden de kinderen ten laste nemen. |
| C6 | Iedereen is bediende, voltijds, het hele jaar, met twaalf gelijke maandlonen. | Zie A6 en A7. |
| C7 | Werknemers krijgen altijd de forfaitaire beroepskosten. | Werkelijke kosten vragen we niet. |
| C8 | Een zelfstandige werkt in hoofdberoep en geeft winst aan met werkelijke kosten. | Bijberoep, baten van vrije beroepen met een kostenforfait, en bedrijfsleiders van een vennootschap zijn niet meegenomen. |
| C9 | "Starter" in de invoer is een primostarter voor het hele jaar. | Het enige wat de RSVZ-tabel voor starters verlaagt, is het minimum. |
| C10 | "AOW" in de invoer betekent bij een zelfstandige: op pensioenleeftijd met een rustpensioen (14,70%). Bij een werknemer verandert er niets. | Zie D4. |
| C11 | Een gehuwde partner "heeft beroepsinkomen" zodra het ingevulde partnerinkomen hoger is dan nul. | De officiële grens is niet opgezocht. |
| C12 | De werkgeverslasten tellen niet mee in "van elke € 100", net als bij Nederland. | Zelfde keuze als METHODOLOGIE.md, punt 2. |

## D. Wat ontbreekt

**In het model op `null` of niet meegerekend:**

| Wat | Stand |
|---|---|
| Gemeentebelasting zonder ingevuld tarief | `null` |
| Kinderbijslag in Wallonië, Brussel en de Duitstalige Gemeenschap | `null`, niet opgezocht |
| Kinderbijslag voor kinderen geboren vóór 2019 (in 2026: vanaf ongeveer 7 jaar) | `null`. Het bedrag hangt af van het gezin op 31 december 2018. De bedragen staan in de bron. |
| Sociale toeslag, schoolbonus en schooltoeslag van het Groeipakket | Niet meegerekend. Bedragen staan in de bron. |
| Zorgtoeslag, kindgebonden budget, huurtoeslag | `null`. Geen Belgische tegenhanger opgezocht. |
| Koophuis: kadastraal inkomen, onroerende voorheffing, woonbonus per gewest | Niet meegerekend. De invoer `woz` en `hypotheekrente` wordt genegeerd en het model meldt dat. |
| Huur | Niet meegerekend. |
| Huwelijksquotiënt en de belasting van de partner | Niet meegerekend. |
| Extra belastingvrije som voor kinderen jonger dan 3 jaar (€ 760) | Niet meegerekend; de leeftijd onder 3 vragen we niet. |
| Belastingvermindering voor pensioenen en het pensioen zelf | Niet meegerekend. |
| Beheerskosten van het sociaal verzekeringsfonds (zelfstandigen) | Niet meegerekend; verschilt per fonds. |
| Gewestelijke opcentiemen en gewestelijke verminderingen | Niet apart berekend; het model rekent met het totale tarief. |
| Ziekenfondsbijdrage, hospitalisatieverzekering, remgeld | Niet meegerekend, zoals de zorgpremie in Nederland. |
| Btw, accijnzen, roerende voorheffing, meerwaardebelasting | Niet meegerekend, zoals in Nederland. |

**In de gegevens op `null` of leeg:**

| Wat | Nodig voor |
|---|---|
| Zorgkosten per persoon naar leeftijd | "Je betaalt zelf" bij Zorg |
| Kosten per leerling per onderwijsniveau | "Je betaalt zelf" bij School en studie |
| Wettelijk pensioen per maand | "Je betaalt zelf" bij Pensioen en vangnet |
| Plannen voor 2027 | De tabel "Wat verandert er in 2027?" |

## Wat is getoetst

`test.js` in deze map doet 54 controles. `landen/nederland/test.js` doet er 6 op de Nederlandse Eurostat-cijfers, waaronder of beide landen hetzelfde jaar en dezelfde groepen gebruiken. Alleen het eerste blok is een echt rekenvoorbeeld van de overheid:

- **Rekenvoorbeeld FOD Financiën** (inkomstenjaar 2025, belastbaar inkomen € 38.000): € 10.484,50. Het model komt op hetzelfde bedrag.
- De andere controles toetsen of het model de tabellen goed toepast op de schijfgrenzen (schijven, belastingvrije som, beroepskosten, werkbonus, bijzondere bijdrage, minimum en maximum voor zelfstandigen) en of de sommen sluiten.

Er is **geen officieel voorbeeld van bruto naar netto** gevonden waarmee de hele keten in één keer te toetsen is. Tax-Calc van FOD Financiën en de bedrijfsvoorheffingsschalen kunnen daarvoor dienen.

De controles zijn in een browser gedraaid (via `buitenland/proef.html`), **niet met Node**: op de computer waar dit is gemaakt stond Node niet. `node buitenland/landen/belgie/test.js`, `node buitenland/landen/nederland/test.js` en `node buitenland/tools/exporteer-data.js --controle` zijn dus nog nooit gedraaid. De JSON-bestanden zijn wel met hetzelfde script gemaakt, in de browser.

## Wat er in `site/` moet veranderen om België aan te sluiten

Niets hiervan is gedaan; `site/`, `data/` en `test.js` zijn niet aangeraakt.

1. **Landkeuze.** `index.html` gebruikt overal `window.Belasting` en `window.Data`. Dat moet een keuze worden tussen `Belasting`/`Data` en `BelastingBelgie`/`DataBelgie`. In de vergelijking hoort bij Nederland `DataNederland` (Eurostat) in plaats van `Data` (Miljoenennota). De bestanden van België moeten dan naar `site/` of daar worden ingeladen; nu mag `site/` niets uit `buitenland/` laden.
2. **De tabel "Laat de hele som zien".** Die is nu uitgeschreven voor Nederland (`r.schijven.s1`, `r.kortingen.algemeen`, enzovoort). Het Belgische model geeft daarvoor een kant-en-klare lijst: `r.som`, met per rij `naam`, `bedrag` en `totaal`. De eenvoudigste weg is het Nederlandse model dezelfde lijst te laten geven.
3. **Invoervelden.** Erbij voor België: gemeentebelasting, gewest, gehuwd of wettelijk samenwonend. Niet van toepassing: urencriterium, WOZ-waarde, hypotheekrente, huur.
4. **Meldingen.** Het Belgische model geeft `r.onbekend` en `r.nietMeegenomen`. Die moeten op de pagina komen.
5. **"Je betaalt zelf".** De functie `zelf()` gebruikt `D.KOSTEN.zorg`, `D.KOSTEN.onderwijs` en `D.KOSTEN.aow` en de Nederlandse toeslagen. Voor België staan die op `null`; de pagina moet dan "onbekend" tonen.
6. **Teksten.** Jaartal, "de overheid geeft hier in 2026 … uit" (België: 2024), de bronnenlijst, en de uitleg onder "Hoe is dit berekend?".
7. **Van netto naar bruto.** De zoekfunctie `brutoBijNetto` werkt ook met het Belgische model, maar door de werkbonus en de kredieten loopt netto bij lage lonen niet altijd gelijkmatig op. Dat is niet getest.
8. **Controles.** `.github/workflows/controles.yml` draait alleen `node test.js`. Voeg `node buitenland/landen/belgie/test.js`, `node buitenland/landen/nederland/test.js` en `node buitenland/tools/exporteer-data.js --controle` toe.
