/** @param {string} id */
export const identificarFont = (id) => `geoexplora-font-${id}`;

/** @param {string} id */
export const identificarCapa = (id) => `geoexplora-capa-${id}`;

/**
 * @param {import('maplibre-gl').Map} mapa
 * @param {import('./capes.js').Capa} capa
 */
export function sincronitzarCapaRaster(mapa, capa) {
	const font = identificarFont(capa.id);
	const identificador = identificarCapa(capa.id);
	if (!mapa.getSource(font)) {
		mapa.addSource(font, {
			type: 'raster',
			tiles: [capa.urlTesselles],
			tileSize: 256,
			attribution: capa.atribucio
		});
	}
	if (!mapa.getLayer(identificador)) {
		mapa.addLayer({
			id: identificador,
			type: 'raster',
			source: font,
			layout: { visibility: capa.visible ? 'visible' : 'none' },
			paint: { 'raster-opacity': capa.opacitat / 100 }
		});
	} else {
		mapa.setLayoutProperty(identificador, 'visibility', capa.visible ? 'visible' : 'none');
		mapa.setPaintProperty(identificador, 'raster-opacity', capa.opacitat / 100);
	}
}

/**
 * @param {import('maplibre-gl').Marker[]} marcadors
 * @param {import('./capes.js').Capa} capa
 */
export function sincronitzarMarcadors(marcadors, capa) {
	const perceptible = capa.visible && capa.opacitat > 0;
	for (const marcador of marcadors) {
		const element = marcador.getElement();
		element.style.display = perceptible ? '' : 'none';
		element.style.opacity = String(capa.opacitat / 100);
		if (!perceptible) marcador.getPopup()?.remove();
	}
}
