# Methodologie

De cijfers op de site komen uit officiële bronnen. Maar welke cijfers je kiest en hoe je ze indeelt, is ook een keuze. Hier staat per keuze wat we doen, wat het alternatief is en waarom we dat niet kozen.

Ben je het met een keuze oneens? Meld het via een [issue](https://github.com/Belastingdashboard/waarblijftmijnbelasting/issues).

## 1. Wat we "belasting" noemen

**Wat we doen.** De site telt de inkomstenbelasting en de premies volksverzekeringen (AOW, Anw, Wlz) die via box 1 worden geheven. Bij een eigen bedrijf komt daar de inkomensafhankelijke bijdrage Zvw bij.

**Niet meegeteld:**

| Wat | Waarom niet |
|---|---|
| Btw, accijnzen, energiebelasting | Hangt af van wat je uitgeeft. Dat vragen we niet. |
| Gemeentelijke belastingen en waterschapsbelasting | Verschilt per gemeente en per woning. |
| Belasting op spaargeld en beleggingen (box 3) | We vragen niet naar vermogen. |
| De premie van je zorgverzekering en het eigen risico | Die betaal je aan je verzekeraar, niet via je loon. |
| Wat je werkgever bovenop je loon afdraagt | Zie punt 2. |

**Gevolg.** Het bedrag op de site is lager dan alles wat je in een jaar aan de overheid betaalt. Loon- en inkomstenbelasting en de premies volksverzekeringen zijn samen 155,2 van de 451,4 miljard euro aan inkomsten van het Rijk in 2026.

## 2. Werkgeverslasten

**Wat we doen.** Een werkgever betaalt bovenop het brutoloon de Zvw-heffing en premies voor WW, arbeidsongeschiktheid en kinderopvang. Het model rekent die uit, maar ze tellen niet mee in "van elke € 100 die je verdient".

**Alternatief.** Ze wel meetellen, omdat een werkgever die kosten uiteindelijk ook uit het loonbudget betaalt. Dan is het aandeel belasting hoger.

**Waarom niet.** De site begint bij wat iemand kent: het bedrag op de bankrekening en het brutoloon op de loonstrook. Werkgeverslasten staan daar niet op.

## 3. Van netto naar bruto

**Wat we doen.** Bezoekers vullen in wat ze per maand ontvangen. Het model zoekt het bruto jaarloon waarbij het netto jaarbedrag gelijk is aan 12 keer dat maandbedrag.

**Beperkingen.**

- Vakantiegeld en een dertiende maand tellen niet mee. Het echte jaarinkomen is daardoor meestal hoger.
- Pensioenpremie is niet meegenomen. "Bruto" is hier het loon waarover belasting wordt berekend, niet het brutoloon vóór pensioenpremie.
- Andere aftrekposten dan hypotheekrente, zoals giften en zorgkosten, zijn niet meegenomen.
- Heb je een koophuis, dan zoeken we het brutoloon op alsof je geen huis had. Het voordeel van de hypotheekrente staat namelijk niet op je loonstrook; je krijgt het van de Belastingdienst. Wie dat voordeel per maand laat uitbetalen en het meetelt in het ingevulde bedrag, krijgt een te hoog brutoloon te zien.

**Alternatief.** Vragen naar het bruto jaarloon. Dat kan op de site ook, maar veel mensen kennen dat bedrag niet.

## 4. Waar gaat elke € 100 heen

**Wat we doen.** We verdelen jouw belasting over de uitgaven van het Rijk in dezelfde verhouding als de Miljoenennota 2026. Gaat 24,6% van de rijksuitgaven naar zorg, dan rekenen we 24,6% van jouw belasting aan zorg toe.

**Alternatieven.**

- *Premies koppelen aan hun doel.* De AOW-premie is bedoeld voor de AOW en de Wlz-premie voor langdurige zorg. Je zou dat deel van de belasting alleen daaraan kunnen toerekenen.
- *Alle collectieve uitgaven nemen,* dus ook wat gemeenten, provincies en waterschappen uit eigen belastingen betalen.

**Waarom niet.** De premies dekken de uitgaven waarvoor ze bedoeld zijn niet volledig; het Rijk vult aan uit de algemene middelen. Een evenredige verdeling is daardoor het eenvoudigst uit te leggen en na te rekenen.

**Indeling.** De Miljoenennota noemt 17 onderdelen. De site voegt die samen tot 11 groepen met een gewone naam. Welke onderdelen in welke groep zitten, staat in `data/2026/rijksuitgaven.json`.

## 5. Het begrotingstekort

**Wat we doen.** Het Rijk geeft in 2026 486,3 miljard euro uit en krijgt 451,4 miljard binnen. Het verschil wordt geleend. De site verdeelt jouw belasting over de uitgaven en laat het tekort niet apart zien.

**Alternatief.** Laten zien dat een deel van elke uitgave met geleend geld wordt betaald.

**Waarom niet.** Dat maakt de hoofdboodschap ingewikkelder. De inkomsten staan wel apart op de site onder "Waar haalt de overheid het geld vandaan?".

**Let op.** Het uitgaventotaal is na de Miljoenennota bijgesteld naar 481,2 miljard. Er is geen nieuwe verdeling per onderdeel gepubliceerd; daarom gebruikt de site de verdeling uit de Miljoenennota.

## 6. "Je houdt over" als de overheid ergens mee stopt

**Wat we doen.** Zet je een groep uit, dan rekenen we: jouw belasting × het aandeel van die groep in de rijksuitgaven.

**Beperking.** Dit gaat alleen over jouw inkomstenbelasting en premies. De overheid betaalt die uitgave ook uit btw, winstbelasting en andere inkomsten. Zou een uitgave echt verdwijnen, dan is niet bekend welke belasting daarvoor omlaag zou gaan.

## 7. "Je betaalt zelf" als de overheid ergens mee stopt

**Wat we doen.** Waar een officieel bedrag per persoon bestaat, gebruiken we dat. Anders delen we de uitgave door het aantal inwoners.

| Groep | Wat we rekenen | Bron |
|---|---|---|
| Zorg | Gemiddelde kosten van de basisverzekering per persoon naar leeftijd (2024), plus de zorgtoeslag die vervalt | CBS, Dienst Toeslagen |
| School en studie | Wat het Rijk per leerling aan de school betaalt, voor kinderen van 6 tot en met 17 | Begroting OCW |
| AOW en vangnet | De AOW, kinderbijslag en het kindgebonden budget die je nu krijgt en dan kwijtraakt | SVB, Dienst Toeslagen |
| Wonen | De huurtoeslag die vervalt | Dienst Toeslagen |
| Alle andere groepen | De uitgave gedeeld door 18.130.208 inwoners, keer het aantal personen in je huishouden | Miljoenennota, CBS |

**Beperkingen.**

- Het zijn gemiddelden. Iemand die veel zorg nodig heeft, betaalt zelf veel meer; iemand die gezond is minder.
- Het verpleeghuis en andere langdurige zorg zitten niet in het zorgbedrag.
- Kinderen van 4 en 5 jaar zijn niet meegeteld bij school.
- Wat het kost om jezelf te verzekeren tegen ziekte, arbeidsongeschiktheid en werkloosheid is onbekend. Daar is geen officieel cijfer van, dus de site noemt geen bedrag.
- Het zijn de kosten van nu. Wat een private markt zou vragen, weten we niet.
- Voor uitgaven als defensie of dijken is "zelf betalen" een rekensom, geen echte keuze. Dat staat er op de site bij.

## 8. Vereenvoudigingen in het rekenmodel

- **Partner.** Het inkomen van de partner telt alleen mee voor de toeslagen en voor de vraag wie de combinatiekorting krijgt. De belasting van de partner rekenen we niet uit.
- **Toeslagen.** Geen toets op vermogen. Kinderopvangtoeslag is niet meegenomen. Bij huurtoeslag is geen rekening gehouden met servicekosten of bijzondere situaties.
- **Afronding.** Zorgtoeslag, kindgebonden budget en huurtoeslag worden per maand naar beneden afgerond op hele euro's, zoals Dienst Toeslagen doet.
- **AOW-leeftijd.** Wie dit aanvinkt, wordt voor het hele jaar als AOW-gerechtigd gezien.
- **Koophuis.** Het eigenwoningforfait telt bij het inkomen op en de hypotheekrente gaat eraf. Is het forfait hoger dan de rente, dan is 71,867% van het verschil aftrekbaar. In de hoogste schijf levert de rente maximaal 37,56% op. Het hele huis en alle rente rekenen we toe aan de invuller, ook met een partner; in werkelijkheid mogen partners dit verdelen. We gaan ervan uit dat alle ingevulde rente aftrekbaar is. Erfpacht, financieringskosten en een restschuld zijn niet meegenomen.
- **Eigen bedrijf.** Een eenmanszaak of vof, geen bv. Alleen zelfstandigenaftrek, startersaftrek en mkb-winstvrijstelling zijn meegenomen.
- **Werkgeverspremies.** De premie Whk verschilt per werkgever; het model gebruikt het gemiddelde percentage.
- **Heffingskortingen** kunnen de belasting niet lager dan nul maken.

## 9. Plannen voor 2027

**Wat we doen.** De site toont de plannen in een tabel naast 2026, met per rij de status. De site rekent er niet mee.

**Waarom.** Op 14 november 2026 waren nog niet alle bedragen bekend, zoals de volledige tabel van de arbeidskorting en de definitieve toeslagen. Een berekening zou dan deels op aannames rusten.

**Bronnen.** Een deel van de rijen komt uit vakpublicaties, omdat er na de amendementen in de Tweede Kamer nog geen officiële tabel is. Die rijen zijn te herkennen aan hun bron en hebben waar nodig een noot. Zodra er een officiële tabel is, vervangen we ze.

## 10. Hoe we controleren

`test.js` vergelijkt het model met de officiële rekenvoorbeelden van Dienst Toeslagen en met de tabellen van de Belastingdienst. Ook controleert het of de uitgaven optellen tot het totaal en of de bestanden in `data/` gelijk lopen met de site. De controles draaien automatisch bij elke wijziging.

Eén uitkomst wijkt bewust af van het officiële rekenblad; dat staat in `CHANGELOG.md`.
