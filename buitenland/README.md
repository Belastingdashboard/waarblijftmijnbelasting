# Buitenland (werk in uitvoering)

Hier komt de vergelijking: "wat als ik met mijn huidige salaris in een ander land woon?" Dit onderdeel staat nog niet op de site.

## Afspraken

Deze map staat los van de Nederlandse tool, zodat hier vrij gebouwd kan worden zonder dat de site verandert.

- **Alles voor het buitenland blijft in deze map.** Niets in `site/` mag iets uit `buitenland/` inladen.
- **De andere kant op mag wel.** Voor de vergelijking mag je het Nederlandse rekenmodel gebruiken: `require('../site/model.js')`.
- **Raak `site/`, `data/` en `test.js` niet aan vanuit dit werk.** Is daar toch iets nodig, doe dat dan in een aparte wijziging.
- **Werk op een eigen branch** en voeg samen via een pull request. De rekencontroles draaien dan vanzelf.

## Dezelfde regels als de rest

- **Geen verzonnen of geschatte cijfers.** Elk cijfer heeft een link naar een officiële bron van dat land (belastingdienst, statistiekbureau, ministerie) en de datum waarop het is nagekeken.
- **Wat niet bekend is, blijft `null`** en komt als "onbekend" op de site.
- **Vergelijk alleen wat vergelijkbaar is.** Schrijf per land op wat niet is meegenomen, zoals huizenprijzen, kosten van levensonderhoud en lokale belastingen.

## Voorgestelde opbouw

| Pad | Inhoud |
|---|---|
| `buitenland/landen/<landcode>/regels.js` | De cijfers van dat land, met bron per onderdeel. |
| `buitenland/landen/<landcode>/model.js` | De rekenfunctie voor dat land, met dezelfde invoer als `site/model.js`. |
| `buitenland/landen/<landcode>/test.js` | Controles tegen officiële rekenvoorbeelden van dat land. |
| `buitenland/proef.html` | Proefpagina om het resultaat te bekijken. Komt niet online. |

Er is nog geen land toegevoegd.
