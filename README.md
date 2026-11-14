# Waar blijft mijn belastinggeld?

De code en de cijfers achter [waarblijftmijnbelasting.nl](https://waarblijftmijnbelasting.nl).

Je vult in wat je per maand op je rekening krijgt. De site laat zien wat je aan belasting betaalt, waar dat geld heen gaat en wat je zelf zou moeten betalen als de overheid met een uitgave stopt.

Alles in deze repo is openbaar zodat iedereen het kan narekenen: de cijfers, de bronnen en de rekenregels.

## Uitgangspunten

- **Geen verzonnen cijfers.** Elk cijfer komt uit een genoemde bron. Wat niet bekend is, staat als "onbekend" op de site en als `null` in de bestanden.
- **Niets wordt opgeslagen.** De berekening gebeurt in de browser van de bezoeker. Er zijn geen cookies, geen trackers en geen verzoeken naar andere servers.
- **Geen bouwstap.** De site bestaat uit losse bestanden die je zo kunt openen en lezen.

## Wie zit hierachter

Glenn en Marit Stringer-Smit. Twee enthousiastelingen die vinden dat het eenvoudiger moet zijn om te zien wat belastingwetten echt betekenen voor jouw eigen situatie.

De makers betalen de site zelf, uit eigen zak. Er zijn geen sponsors, advertenties of subsidies.

## Wat staat waar

| Map of bestand | Inhoud |
|---|---|
| `site/` | De website zelf. Alleen deze map komt online. |
| `site/model.js` | Het rekenmodel voor belasting en toeslagen 2026. |
| `site/data.js` | Rijksuitgaven, inkomsten, kosten per persoon en de plannen voor 2027. |
| `site/index.html` | De pagina: invulvelden, uitleg en weergave. |
| `data/` | Dezelfde cijfers als leesbare JSON, per jaar, met bron per onderdeel. |
| `test.js` | De rekencontroles. |
| `tools/exporteer-data.js` | Maakt de bestanden in `data/` opnieuw uit de cijfers van de site. |
| `buitenland/` | Werk in uitvoering: vergelijking met andere landen. Staat niet op de site. |
| `METHODOLOGIE.md` | Welke keuzes en aannames er gemaakt zijn, en wat het alternatief was. |
| `CHANGELOG.md` | Elke wijziging in cijfers of methode. |
| `LICENSE` | De licentie voor de code (EUPL-1.2). |

## Zelf draaien

Je hebt alleen [Node.js](https://nodejs.org) nodig. Er zijn geen pakketten om te installeren.

```bash
node test.js
```

```bash
node .claude/serve.js
```

De site staat daarna op http://localhost:8765.

## Een cijfer wijzigen

1. Pas het cijfer aan in `site/model.js` of `site/data.js`, met de bron erbij.
2. Draai `node tools/exporteer-data.js` zodat `data/` weer gelijk loopt.
3. Draai `node test.js`.
4. Schrijf de wijziging op in `CHANGELOG.md`, met datum en reden.

De controles draaien ook automatisch op GitHub bij elke wijziging.

## Een fout melden

Zie je een cijfer of berekening die niet klopt? Maak een [issue](https://github.com/Belastingdashboard/waarblijftmijnbelasting/issues) aan en noem het cijfer, wat het volgens jou moet zijn en de bron.

## Handleiding voor AI

Deze paragraaf is geschreven voor AI-assistenten (zoals ChatGPT, Gemini, Grok, Claude of Copilot) die namens iemand de site willen controleren of willen uitrekenen wat die persoon betaalt.

**Waar je de gegevens vindt**

| Wat | Adres |
|---|---|
| Belastingregels 2026 | https://raw.githubusercontent.com/Belastingdashboard/waarblijftmijnbelasting/main/data/2026/belastingregels.json |
| Rijksuitgaven, inkomsten en kosten per persoon 2026 | https://raw.githubusercontent.com/Belastingdashboard/waarblijftmijnbelasting/main/data/2026/rijksuitgaven.json |
| Plannen 2027 (alleen vergelijking) | https://raw.githubusercontent.com/Belastingdashboard/waarblijftmijnbelasting/main/data/2027/plannen.json |
| Rekenmodel | https://raw.githubusercontent.com/Belastingdashboard/waarblijftmijnbelasting/main/site/model.js |
| Keuzes en aannames | https://raw.githubusercontent.com/Belastingdashboard/waarblijftmijnbelasting/main/METHODOLOGIE.md |

**Hoe je de cijfers controleert**

- Elk onderdeel in de JSON-bestanden heeft een veld `bron` of `bronnen` met de link naar de officiële publicatie. Vergelijk het cijfer met die publicatie.
- `gecontroleerdOp` is de datum waarop de makers de bron voor het laatst hebben nagelopen. Is de bron sindsdien gewijzigd, meld dat dan aan de gebruiker.
- Percentages staan als breuk: `0.3575` betekent 35,75%.
- `null` betekent: niet gevonden in een officiële bron. Vul dat niet zelf in.

**Hoe je voor iemand rekent**

De functie `bereken(invoer)` in `site/model.js` is de enige rekenfunctie. De invoer:

```js
{
  type: 'loondienst',        // of 'ondernemer'
  brutoLoon: 42000,          // bruto jaarloon (loondienst)
  omzet: 0, kosten: 0,       // per jaar (ondernemer)
  urencriterium: false, starter: false,
  aow: false,                // AOW-leeftijd bereikt
  partner: false, partnerInkomen: 0,
  kinderen: { k0tot5: 0, k6tot11: 0, k12tot15: 0, k16en17: 0 },
  huur: 0                    // kale huur per maand, 0 = geen huurwoning
}
```

De uitkomst bevat onder meer `inkomstenbelasting`, `heffingTotaal`, `netto`, `kortingen`, `toeslagen` en `nettoInclToeslagen`, allemaal per jaar.

De site vraagt bezoekers naar hun netto maandbedrag en zoekt daar het bruto jaarloon bij, met 12 keer het maandbedrag. Vakantiegeld telt daarbij niet mee.

**Wat je de gebruiker eerlijk moet vertellen**

- Dit is belastingjaar 2026, box 1. Spaargeld en beleggingen, pensioenpremie, hypotheekrente, btw en accijnzen zitten er niet in.
- De plannen voor 2027 zijn nog niet allemaal definitief en de site rekent er niet mee.
- De uitkomst is een benadering en geen belastingadvies. Zie `METHODOLOGIE.md` voor alle beperkingen.

## Licentie

Je mag alles in deze repo gebruiken, aanpassen en verder verspreiden. De voorwaarde is dat wat je ermee maakt ook open blijft, onder dezelfde voorwaarden.

- **Code:** [EUPL-1.2](LICENSE), de open-sourcelicentie van de Europese Commissie. Er is ook een [officiële Nederlandse tekst](https://interoperable-europe.ec.europa.eu/collection/eupl/eupl-text-eupl-12).
- **Teksten en de indeling van de cijfers:** [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/deed.nl). Noem bij hergebruik "waarblijftmijnbelasting.nl" als bron.
- **De cijfers van de overheid zelf** zijn feiten uit openbare bronnen. Daar geldt deze licentie niet voor; zie de bron per cijfer.

© 2026 Glenn en Marit Stringer-Smit

## English summary

This is the source of waarblijftmijnbelasting.nl, a Dutch tool that shows what a person pays in income tax in 2026, where that money goes, and what they would have to pay themselves if the government stopped funding something. All figures come from named official sources, calculations run in the browser, and nothing is stored.
