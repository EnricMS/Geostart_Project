# Revisió de la primera versió

La compilació comprova el codi, però no garanteix que tots els serveis cartogràfics externs responguin. Les proves visuals següents queden pendents de confirmació manual. No s'han generat captures ni s'ha publicat encara la demostració.

## Comprovacions de codi

Verificades el 15 d'octubre de 2026: Prettier i ESLint correctes; Svelte sense errors ni avisos; compilació correcta; resposta de l'endpoint amb estat 200 i JSON; identificadors del catàleg únics, URL HTTPS i quatre punts GeoJSON amb coordenades dins dels rangs geogràfics. La prova de l'endpoint ha cridat directament la funció `GET`, no una petició HTTP des del navegador.

La compilació manté un advertiment de mida del paquet de MapLibre i el missatge d'`adapter-auto` fora d'un proveïdor detectat. No són errors de compilació.

```sh
npm run check
npm run lint
npm run build
```

## Proves manuals abans de publicar

- [ ] Obrir el visor i comprovar que no hi ha errors a la consola.
- [ ] Canviar entre cartografia grisa i ortofoto; conservar el centre i el zoom.
- [ ] Activar la geologia, moure el mapa i comprovar que arriben imatges noves.
- [ ] Provar opacitats de 0, 50 i 100 %.
- [ ] Canviar de mapa base amb la geologia activada; conservar visibilitat i opacitat.
- [ ] Mostrar i amagar els punts; tancar les seves finestres en amagar-los.
- [ ] Obrir les finestres amb ratolí i teclat.
- [ ] Plegar i desplegar el menú sense canviar les seleccions.
- [ ] Provar una amplada aproximada de 390 px i una de 1440 px; sense desbordament horitzontal.
- [ ] Recórrer els controls amb Tab i comprovar el focus visible.
- [ ] Obrir els enllaços de font i llegenda; comprovar que són recursos de l'ICGC.
- [ ] Veure les atribucions del mapa i distingir els punts de prova de les dades oficials.
- [ ] Obrir `/api/capes` i comprovar la resposta JSON.
- [ ] Bloquejar temporalment `/api/capes` a les eines de desenvolupament, recarregar i comprovar el missatge i el botó de reintent. Retirar el bloqueig i tornar-ho a provar.
- [ ] Bloquejar temporalment les peticions WMS geològiques i navegar a una zona nova. Comprovar el missatge d'error; retirar el bloqueig i recarregar.

No cal apagar tota la xarxa per provar els errors. Una imatge en memòria cau pot continuar visible i no demostra que el servei estigui disponible.

## Captures per al portfolio

Fer-les després de validar el visor, amb atribucions visibles i sense eines de desenvolupament. Desar-les a `docs/captures/` i afegir-les al README quan existeixin:

1. Cartografia grisa amb el menú desplegat.
2. Geologia amb opacitat al 100 %.
3. Ortofoto amb geologia al 50 %.
4. Vista de mòbil.

## Text per al currículum

**GeoExplora — Visor cartogràfic i geològic.** Projecte personal amb Svelte 5, SvelteKit, JavaScript i MapLibre GL JS. Integració de serveis cartogràfics de l'ICGC, control de visibilitat i opacitat de capes, punts GeoJSON i API de catàleg en un entorn Node.js. Repositori i demostració: afegir els enllaços després de publicar-los.

## Guió de demostració, 2–3 minuts

1. Explicar l'objectiu: comparar cartografia i geologia sobre una zona de Catalunya.
2. Mostrar el canvi de mapa base, la geologia i el lliscador d'opacitat.
3. Mostrar els punts GeoJSON, les finestres i el control de visibilitat.
4. Obrir `/api/capes` i explicar què proporciona el backend i què arriba directament de l'ICGC.
5. Explicar una decisió: recuperar les capes després de `setStyle` i coordinar la resposta de l'API amb `style.load`.
6. Reconèixer les limitacions: imatges sense consulta d'atributs i cartografia dependent de l'escala.
