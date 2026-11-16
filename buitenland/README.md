# Buitenland (werk in uitvoering)

Hier komt de vergelijking: "wat als ik met mijn huidige salaris in een ander land woon?" Dit onderdeel staat nog niet op de site.

## Afspraken

Deze map staat los van de Nederlandse tool, zodat hier vrij gebouwd kan worden zonder dat de site verandert.

- **Alles voor het buitenland blijft in deze map.** Niets in `site/` mag iets uit `buitenland/` inladen. Eén uitzondering: de hoofdpagina heeft een link naar `buitenland/vergelijken.html`, die online verborgen blijft (zie "De vergelijkingspagina").
- **De andere kant op mag wel.** Voor de vergelijking mag je het Nederlandse rekenmodel gebruiken: `require('../site/model.js')`.
- **Raak `site/`, `data/` en `test.js` niet aan vanuit dit werk.** Is daar toch iets nodig, doe dat dan in een aparte wijziging.
- **Werk op een eigen branch** en voeg samen via een pull request. De rekencontroles draaien dan vanzelf.

## Dezelfde regels als de rest

- **Geen verzonnen of geschatte cijfers.** Elk cijfer heeft een link naar een officiële bron van dat land (belastingdienst, statistiekbureau, ministerie) en de datum waarop het is nagekeken.
- **Wat niet bekend is, blijft `null`** en komt als "onbekend" op de site.
- **Vergelijk alleen wat vergelijkbaar is.** Schrijf per land op wat niet is meegenomen, zoals huizenprijzen, kosten van levensonderhoud en lokale belastingen.

## Voorgestelde opbouw

Elk land krijgt een map met de **volledige Nederlandse naam** in kleine letters, zonder accenten en met een streepje in plaats van een spatie: `belgie`, `nederland`, `verenigd-koninkrijk`. Geen afkortingen van twee letters; met veel landen zijn die niet meer te herkennen. Hetzelfde geldt voor namen in de code (`BelastingBelgie`, `DataNederland`) en voor het veld `land` in de gegevens.

| Pad | Inhoud |
|---|---|
| `buitenland/landen/<land>/regels.js` | De cijfers van dat land, met bron per onderdeel. |
| `buitenland/landen/<land>/model.js` | De rekenfunctie voor dat land, met dezelfde invoer als `site/model.js`. |
| `buitenland/landen/<land>/data.js` | Overheidsuitgaven, inkomsten en inwoners van dat land, in dezelfde opbouw als `site/data.js`. |
| `buitenland/landen/<land>/test.js` | Controles tegen officiële rekenvoorbeelden van dat land. |
| `buitenland/landen/<land>/data/` | Dezelfde cijfers als leesbare JSON, per jaar. |
| `buitenland/landen/<land>/OPEN-PUNTEN.md` | Wat onduidelijk is, welke aannames er zijn gedaan en wat ontbreekt. |
| `buitenland/tools/exporteer-data.js` | Maakt de JSON-bestanden opnieuw uit `regels.js` en `data.js`. |
| `buitenland/landen/index.js` | De lijst van landen voor de vergelijkingspagina. Een nieuw land is hier één blok. |
| `buitenland/vergelijken.html` | De vergelijkingspagina zoals de bezoeker die te zien krijgt: Nederland naast een ander land. Opzet, nog niet online. |
| `buitenland/proef.html` | Technische proefpagina met de uitkomst van de rekencontroles. Komt niet online. |

## De vergelijkingspagina (opzet)

**Hoe het werkt.** Onderaan de hoofdpagina (`site/index.html`) staat een blok "Andere landen vergelijken" met een knop. Die opent `buitenland/vergelijken.html` en geeft mee wat de bezoeker invulde: soort werk, bruto loon of omzet en kosten, partner, kinderen, AOW. Op de vergelijkingspagina kiest de bezoeker een land en ziet:

1. wat je met hetzelfde bruto bedrag in beide landen overhoudt,
2. de hele som voor beide landen,
3. waar jouw belasting heen gaat, per maand en per land, uit dezelfde Eurostat-cijfers, met schuifjes zoals op de hoofdpagina: zet een groep uit en zie per land wat je overhoudt en wat je zelf betaalt,
4. wat de vergelijking niet laat zien.

**Het blok is online niet te zien.** Het staat verborgen in de pagina en verschijnt alleen op je eigen computer (`localhost` of `127.0.0.1`), en alleen als de vergelijkingspagina daar te openen is. Gaat `site/` online, dan ziet een bezoeker er niets van. Dit is de enige wijziging in `site/`; het rekenmodel en de cijfers van de site zijn niet aangeraakt.

**Bekijken.** Start een server op de hoofdmap van de repo (zie "Zelf draaien") en open http://127.0.0.1:8766/site/index.html. Met `node tools/serve.js` werkt het niet: die toont alleen `site/`, dus het blok blijft dan verborgen.

**Een land toevoegen.** Maak de map `landen/<land>/`, laad de bestanden in `vergelijken.html` en voeg één blok toe aan `landen/index.js`. Extra vragen voor dat land (zoals de gemeentebelasting in België) staan in dat blok onder `velden`; de pagina tekent ze vanzelf.

**Nog te beslissen of te doen voordat dit online kan:**

- **Waar de pagina komt te staan.** Alleen `site/` gaat online. De vergelijkingspagina en de landen moeten dan naar `site/`, of de publicatie moet ook `buitenland/` meenemen. Daarna kan de controle op `localhost` uit `site/index.html` weg.
- **Invoer in het adres.** Wat de bezoeker invulde staat achter het hekje in het adres van de vergelijkingspagina (`#type=loondienst&bruto=40000`). Dat deel gaat niet naar een server, maar het staat wel in de browsergeschiedenis en gaat mee als iemand de link deelt. Het alternatief is dat de bezoeker het loon opnieuw invult.
- **Alleen het bruto bedrag gaat mee.** Vulde de bezoeker een netto maandbedrag in, dan gaat het bruto jaarloon mee dat de hoofdpagina daarbij zocht. Huur en koophuis gaan niet mee; die worden niet vergeleken. Voor Nederland wijkt het bedrag "je houdt over" daardoor af van de hoofdpagina bij wie een koophuis invulde.
- **Toeslagen.** De pagina toont alleen de kinderbijslag. Zorgtoeslag, kindgebonden budget en huurtoeslag staan er voor Nederland niet bij, omdat er voor België geen tegenhanger is opgezocht.
- **"Je betaalt zelf" is grover dan op de hoofdpagina.** De vergelijking heeft dezelfde schuifjes, met per land wat je overhoudt en wat je zelf betaalt. "Je betaalt zelf" is voor elke groep de uitgave gedeeld door het aantal inwoners, keer het aantal personen in je huishouden. De hoofdpagina rekent voor zorg, school en AOW met preciezere bedragen per persoon; die ontbreken voor België. Voor Nederland geeft de vergelijking bij die groepen dus een ander bedrag dan de hoofdpagina. De uitgaven zijn van 2024, het aantal inwoners van 1 januari 2026.
- **Alles in `landen/belgie/OPEN-PUNTEN.md`.** De pagina waarschuwt bij een land met status `proef`.

## Landen

| Land | Map | Stand |
|---|---|---|
| Nederland | `landen/nederland/` | Alleen de uitgaven en inkomsten van de hele overheid volgens Eurostat (2024), zodat Nederland op dezelfde basis naast andere landen staat. Het rekenmodel blijft `site/model.js`. |
| België | `landen/belgie/` | Eerste opzet voor inkomstenjaar 2026. Nog niet door een mens nagekeken en niet klaar voor de site. Lees eerst [`landen/belgie/OPEN-PUNTEN.md`](landen/belgie/OPEN-PUNTEN.md). |

## Zelf draaien

De controles voor België:

```bash
node buitenland/landen/belgie/test.js
```

De controles op de Nederlandse Eurostat-cijfers:

```bash
node buitenland/landen/nederland/test.js
```

De JSON-bestanden opnieuw maken na een wijziging in een `regels.js` of `data.js`:

```bash
node buitenland/tools/exporteer-data.js
```

De proefpagina bekijken: start `node tools/serve.js` niet (die toont alleen `site/`), maar open een server op de hoofdmap van de repo en ga naar `/buitenland/proef.html`. Bijvoorbeeld:

```bash
python -m http.server 8766 --bind 127.0.0.1
```

De pagina staat dan op http://127.0.0.1:8766/buitenland/proef.html en laat ook de uitkomst van de controles zien.
