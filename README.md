# GeoExplora

Visor cartogràfic i geològic de Catalunya desenvolupat com a projecte personal d'aprenentatge i portfolio. Combina Svelte, JavaScript, MapLibre GL JS i una API de catàleg amb SvelteKit.

Permet comparar una zona sobre cartografia grisa o ortofoto, superposar-hi el mapa geològic general de l'ICGC i controlar-ne l'opacitat.

**Estat:** primera versió local. La publicació, les captures i la revisió visual final estan pendents. No és un producte oficial de l'ICGC.

## Funcionalitats

- Cartografia grisa i ortofoto amb topònims, seleccionables com a mapa base.
- Mapa geològic general via WMS, amb visibilitat i opacitat independents.
- Punts de prova GeoJSON a Barcelona, Girona, Tarragona i Lleida, amb finestres informatives.
- Control per amagar els punts i les seves finestres.
- Ajust inicial de la vista a l'extensió dels punts.
- Menú plegable, disposició adaptable i etiquetes en català.
- Informació de fonts i enllaç a la llegenda oficial del servei geològic.
- Estats de càrrega i error del catàleg i de les imatges geològiques.
- Endpoint `/api/capes` amb les metadades i la connexió de la capa.

## Tecnologies

| Part            | Eines                                 |
| --------------- | ------------------------------------- |
| Interfície      | Svelte 5, HTML i CSS                  |
| Aplicació i API | SvelteKit 3, JavaScript amb JSDoc     |
| Cartografia     | MapLibre GL JS 6, GeoJSON i WMS       |
| Desenvolupament | Node.js, npm, Vite, ESLint i Prettier |

## API

`GET /api/capes` retorna un array JSON amb una entrada geològica. No necessita autenticació ni rep paràmetres.

| Camp                           | Significat                                   |
| ------------------------------ | -------------------------------------------- |
| `id`                           | Identificador estable de la capa             |
| `nom`, `descripcio`            | Informació visible al visor                  |
| `organisme`                    | Proveïdor de les dades                       |
| `urlInformacio`, `urlLlegenda` | Documentació i llegenda oficials             |
| `tipusServei`                  | WMS                                          |
| `consultable`                  | `false`: aquesta versió no consulta atributs |
| `urlTesselles`                 | Plantilla WMS GetMap amb `{bbox-epsg-3857}`  |
| `atribucio`                    | Crèdits cartogràfics                         |

## Fonts i condicions d'ús

- [Servei de Mapa Base de l'ICGC](https://www.icgc.cat/ca/Geoinformacio-i-mapes/Servei-de-Mapa-Base): bases grisa i ortofoto, capa geològica, característiques tècniques i atribucions.
- [Llegenda del servei Mapa Base Geològic](https://geoserveis.icgc.cat/vector02/rest/services/mapa_base_geologic/MapServer/legend): simbologia del servei. És extensa i agrupa dades de diverses escales.
- [MapLibre GL JS](https://maplibre.org/maplibre-gl-js/docs/): biblioteca cartogràfica amb llicència BSD-3-Clause.

Les atribucions es mantenen visibles al mapa. Les dades i les imatges dels proveïdors conserven les seves condicions d'ús; la llicència de MapLibre no s'estén als mapes ni al codi propi del projecte. Consultar el detall de l'ICGC, OpenStreetMap/OpenMapTiles i els proveïdors d'imatge que corresponguin a cada base i territori.
