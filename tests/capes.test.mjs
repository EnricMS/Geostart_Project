import prova from 'node:test';
import assert from 'node:assert/strict';
import {
	crearCapaPunts,
	validarCataleg,
	esOpacitatValida,
	cercarCapes,
	restablirCapa
} from '../src/lib/capes.js';
import {
	identificarCapa,
	identificarFont,
	sincronitzarCapaRaster,
	sincronitzarMarcadors
} from '../src/lib/mapaCapes.js';
import { GET } from '../src/routes/api/capes/+server.js';

prova('el catàleg real de l’API es pot consumir amb el model nou', async () => {
	const resposta = GET();
	assert.equal(resposta.status, 200);
	assert.match(resposta.headers.get('content-type'), /application\/json/);
	const capes = validarCataleg(await resposta.json());
	assert.ok(capes.some((capa) => capa.id === 'geologia-general'));
});

function entradaValida(canvis = {}) {
	return {
		id: 'geologia-general',
		nom: 'Mapa geològic general',
		descripcio: 'Geologia de Catalunya',
		organisme: 'ICGC',
		atribucio: '© ICGC',
		tipusServei: 'WMS',
		urlInformacio: 'https://www.icgc.cat/',
		urlLlegenda: 'https://geoserveis.icgc.cat/llegenda',
		urlTesselles:
			'https://geoserveis.icgc.cat/wms?REQUEST=GetMap&SRS=EPSG:3857&BBOX={bbox-epsg-3857}&WIDTH=256&HEIGHT=256',
		...canvis
	};
}

prova('el catàleg vàlid conserva les metadades i estableix els valors inicials', () => {
	const [capa] = validarCataleg([entradaValida()]);
	assert.equal(capa.visible, false);
	assert.equal(capa.opacitat, 70);
	assert.equal(capa.tipus, 'raster');
	assert.equal(capa.nom, 'Mapa geològic general');
});

prova('una llista buida és una càrrega vàlida, no un error', () =>
	assert.deepEqual(validarCataleg([]), [])
);

prova('rebutja estructures incompatibles abans de crear capes', () => {
	for (const dades of [null, {}, 'text', [null], [3], [[entradaValida()]]])
		assert.throws(() => validarCataleg(dades));
});

prova('rebutja identificadors duplicats, reservats o insegurs', () => {
	assert.throws(() => validarCataleg([entradaValida(), entradaValida()]));
	for (const id of ['punts-prova', '', 'nom amb espais', '<script>', '__proto__']) {
		assert.throws(() => validarCataleg([entradaValida({ id })]));
	}
});

prova('rebutja metadades incompletes i enllaços no HTTPS o amb credencials', () => {
	for (const canvis of [
		{ nom: '' },
		{ atribucio: null },
		{ organisme: ' ' },
		{ urlInformacio: 'javascript:alert(1)' },
		{ urlLlegenda: 'http://exemple.cat/' },
		{ urlInformacio: 'https://usuari:secret@exemple.cat/' }
	]) {
		assert.throws(() => validarCataleg([entradaValida(canvis)]));
	}
});

prova('rebutja una plantilla cartogràfica amb projecció o dimensions incompatibles', () => {
	const entrada = entradaValida();
	for (const urlTesselles of [
		entrada.urlTesselles.replace('EPSG:3857', 'EPSG:4326'),
		entrada.urlTesselles.replace('WIDTH=256', 'WIDTH=512'),
		entrada.urlTesselles.replace('{bbox-epsg-3857}', '0,0,1,1')
	]) {
		assert.throws(() => validarCataleg([entradaValida({ urlTesselles })]));
	}
});

prova('accepta opacitat zero i rebutja percentatges invàlids o booleans', () => {
	for (const valor of [0, 70, 100]) assert.equal(esOpacitatValida(valor), true);
	for (const valor of [-1, 101, NaN, Infinity, '70', true, null])
		assert.equal(esOpacitatValida(valor), false);
	assert.equal(
		validarCataleg([entradaValida({ visibleInicial: true, opacitatInicial: 0 })])[0].opacitat,
		0
	);
	assert.throws(() => validarCataleg([entradaValida({ visibleInicial: 'false' })]));
	assert.throws(() => validarCataleg([entradaValida({ opacitatInicial: 101 })]));
});

prova('la cerca ignora accents, majúscules i espais exteriors, sense alterar la selecció', () => {
	const capes = [...validarCataleg([entradaValida()]), crearCapaPunts()];
	assert.equal(cercarCapes(capes, ' GEOLÒGIC ')[0].id, 'geologia-general');
	assert.equal(cercarCapes(capes, 'punts')[0].id, 'punts-prova');
	assert.equal(cercarCapes(capes, '').length, 2);
	assert.equal(cercarCapes(capes, 'inexistent').length, 0);
	assert.equal(capes.length, 2);
});

prova('restablir respecta els valors inicials diferents de punts i geologia', () => {
	const capes = [...validarCataleg([entradaValida()]), crearCapaPunts()];
	for (const capa of capes) {
		capa.visible = !capa.visible;
		capa.opacitat = 0;
		restablirCapa(capa);
	}
	assert.equal(capes[0].visible, false);
	assert.equal(capes[0].opacitat, 70);
	assert.equal(capes[1].visible, true);
	assert.equal(capes[1].opacitat, 100);
});

function crearMapaSimulat() {
	const fonts = new Map();
	const capes = new Map();
	return {
		fonts,
		capes,
		getSource(id) {
			return fonts.get(id);
		},
		addSource(id, font) {
			assert.equal(fonts.has(id), false);
			fonts.set(id, font);
		},
		getLayer(id) {
			return capes.get(id);
		},
		addLayer(capa) {
			assert.equal(capes.has(capa.id), false);
			capes.set(capa.id, structuredClone(capa));
		},
		setLayoutProperty(id, propietat, valor) {
			capes.get(id).layout[propietat] = valor;
		},
		setPaintProperty(id, propietat, valor) {
			capes.get(id).paint[propietat] = valor;
		}
	};
}

prova('el model actualitza visibilitat i opacitat del mapa sense duplicar fonts', () => {
	const mapa = crearMapaSimulat();
	const [capa] = validarCataleg([entradaValida()]);
	sincronitzarCapaRaster(mapa, capa);
	capa.visible = true;
	capa.opacitat = 25;
	sincronitzarCapaRaster(mapa, capa);
	assert.equal(mapa.fonts.size, 1);
	assert.equal(mapa.capes.size, 1);
	assert.equal(mapa.capes.get(identificarCapa(capa.id)).layout.visibility, 'visible');
	assert.equal(mapa.capes.get(identificarCapa(capa.id)).paint['raster-opacity'], 0.25);
	capa.visible = false;
	sincronitzarCapaRaster(mapa, capa);
	assert.equal(mapa.capes.get(identificarCapa(capa.id)).layout.visibility, 'none');
});

prova('després de substituir l’estil es recupera la mateixa selecció', () => {
	const mapa = crearMapaSimulat();
	const [capa] = validarCataleg([entradaValida()]);
	capa.visible = true;
	capa.opacitat = 40;
	sincronitzarCapaRaster(mapa, capa);
	mapa.fonts.clear();
	mapa.capes.clear();
	sincronitzarCapaRaster(mapa, capa);
	assert.ok(mapa.fonts.has(identificarFont(capa.id)));
	assert.equal(mapa.capes.get(identificarCapa(capa.id)).layout.visibility, 'visible');
	assert.equal(mapa.capes.get(identificarCapa(capa.id)).paint['raster-opacity'], 0.4);
});

prova('amagar punts o deixar-los transparents tanca la finestra i permet recuperar-los', () => {
	const element = { style: {} };
	let tancaments = 0;
	const marcador = { getElement: () => element, getPopup: () => ({ remove: () => tancaments++ }) };
	const capa = crearCapaPunts();
	capa.opacitat = 0;
	sincronitzarMarcadors([marcador], capa);
	assert.equal(element.style.display, 'none');
	assert.equal(tancaments, 1);
	capa.opacitat = 50;
	sincronitzarMarcadors([marcador], capa);
	assert.equal(element.style.display, '');
	assert.equal(element.style.opacity, '0.5');
	capa.visible = false;
	sincronitzarMarcadors([marcador], capa);
	assert.equal(element.style.display, 'none');
	assert.equal(tancaments, 2);
});
