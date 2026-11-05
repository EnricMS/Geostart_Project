<script>
	import { onMount } from 'svelte';
	import rutaWorker from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
	import 'maplibre-gl/dist/maplibre-gl.css';
	import {
		Map as MapaMapLibre,
		Marker as MarcadorMapLibre,
		Popup as FinestraMapa,
		LngLatBounds as LimitsGeografics,
		setWorkerUrl as establirRutaWorker
	} from 'maplibre-gl';
	import puntsProva from '../dades/puntsProva.json';
	import MenuCapes from './MenuCapes.svelte';
	import { crearCapaPunts, validarCataleg, esOpacitatValida, restablirCapa } from '../capes.js';
	import {
		identificarFont,
		identificarCapa,
		sincronitzarCapaRaster,
		sincronitzarMarcadors
	} from '../mapaCapes.js';

	/** @type {HTMLDivElement} */
	let contenidorMapa;
	/** @type {import('../capes.js').Capa[]} */
	let capes = $state([crearCapaPunts()]);
	/** @type {'gris' | 'ortofoto'} */
	let baseSeleccionada = $state('gris');
	let carregantCataleg = $state(true);
	let catalegCarregat = $state(false);
	let errorCataleg = $state('');
	let errorMapa = $state('');
	/** @type {Record<string, boolean>} */
	let carregantCapes = $state({});
	/** @type {Record<string, string>} */
	let errorsCapes = $state({});
	/** @type {MapaMapLibre | undefined} */
	let mapa;
	/** @type {AbortController | undefined} */
	let controladorCataleg;
	let estilPreparat = false;
	let componentActiu = false;
	/** @type {MarcadorMapLibre[]} */
	const marcadors = [];
	const estilsBase = {
		gris: 'https://geoserveis.icgc.cat/styles/mapa-base-estandard-gris.json',
		ortofoto: 'https://geoserveis.icgc.cat/styles/mapa-base-orto-hibrida.json'
	};

	function sincronitzarCapes() {
		for (const capa of capes) {
			if (capa.tipus === 'punts') {
				sincronitzarMarcadors(marcadors, capa);
				continue;
			}
			if (!mapa || !estilPreparat) continue;
			try {
				sincronitzarCapaRaster(mapa, capa);
				carregantCapes[capa.id] = capa.visible && !mapa.isSourceLoaded(identificarFont(capa.id));
			} catch {
				errorsCapes[capa.id] = 'No s’ha pogut preparar aquesta capa. Torna-ho a provar.';
			}
		}
	}

	/** @param {string} id @param {boolean} visible */
	function establirVisibilitat(id, visible) {
		const capa = capes.find((capaActual) => capaActual.id === id);
		if (!capa) return;
		capa.visible = visible;
		sincronitzarCapes();
	}

	/** @param {string} id @param {number} opacitat */
	function establirOpacitat(id, opacitat) {
		if (!esOpacitatValida(opacitat)) return;
		const capa = capes.find((capaActual) => capaActual.id === id);
		if (!capa) return;
		capa.opacitat = opacitat;
		sincronitzarCapes();
	}

	/** @param {boolean} visible */
	function establirVisibilitatGlobal(visible) {
		for (const capa of capes) capa.visible = visible;
		sincronitzarCapes();
	}

	/** @param {string} id */
	function restablirUnaCapa(id) {
		const capa = capes.find((capaActual) => capaActual.id === id);
		if (!capa) return;
		restablirCapa(capa);
		sincronitzarCapes();
	}

	function restablirTotes() {
		for (const capa of capes) restablirCapa(capa);
		sincronitzarCapes();
	}

	/** @param {'gris' | 'ortofoto'} base */
	function canviarBase(base) {
		if (!mapa || base === baseSeleccionada) return;
		baseSeleccionada = base;
		estilPreparat = false;
		errorsCapes = {};
		for (const capa of capes) carregantCapes[capa.id] = capa.tipus === 'raster' && capa.visible;
		mapa.setStyle(estilsBase[base], { diff: false });
	}

	/** @param {string} id */
	function reintentarCapa(id) {
		if (!mapa || !estilPreparat) return;
		const capa = capes.find((capaActual) => capaActual.id === id && capaActual.tipus === 'raster');
		if (!capa) return;
		const identificador = identificarCapa(id);
		const font = identificarFont(id);
		if (mapa.getLayer(identificador)) mapa.removeLayer(identificador);
		if (mapa.getSource(font)) mapa.removeSource(font);
		delete errorsCapes[id];
		carregantCapes[id] = capa.visible;
		sincronitzarCapes();
	}

	async function carregarCataleg() {
		if (!componentActiu || controladorCataleg) return;
		controladorCataleg = new AbortController();
		carregantCataleg = true;
		errorCataleg = '';
		try {
			const resposta = await fetch('/api/capes', { signal: controladorCataleg.signal });
			if (!resposta.ok)
				throw new Error(`No s’ha pogut carregar el catàleg (HTTP ${resposta.status}).`);
			const dades = validarCataleg(await resposta.json());
			if (!componentActiu) return;
			const capesLocals = capes.filter((capa) => capa.tipus === 'punts');
			capes = [...dades, ...capesLocals];
			catalegCarregat = true;
		} catch (error) {
			if (!componentActiu || controladorCataleg.signal.aborted) return;
			errorCataleg = error instanceof Error ? error.message : 'No s’ha pogut llegir el catàleg.';
		} finally {
			controladorCataleg = undefined;
			if (componentActiu) carregantCataleg = false;
		}
		if (componentActiu) sincronitzarCapes();
	}

	onMount(() => {
		componentActiu = true;
		establirRutaWorker(rutaWorker);
		/** @type {ResizeObserver | undefined} */
		let observadorMida;
		try {
			mapa = new MapaMapLibre({
				container: contenidorMapa,
				style: estilsBase.gris,
				center: [2, 41.8],
				zoom: 7,
				locale: {
					'Map.Title': 'Mapa interactiu',
					'Marker.Title': 'Punt del mapa',
					'AttributionControl.ToggleAttribution': 'Mostrar o amagar les atribucions',
					'AttributionControl.MapFeedback': 'Comentaris sobre el mapa',
					'Popup.Close': 'Tancar la finestra',
					'LogoControl.Title': 'Logotip de MapLibre'
				}
			});
			mapa.on('style.load', () => {
				estilPreparat = true;
				errorMapa = '';
				sincronitzarCapes();
			});
			mapa.on('sourcedataloading', (esdeveniment) => {
				const capa = capes.find(
					(capaActual) =>
						capaActual.tipus === 'raster' &&
						identificarFont(capaActual.id) === esdeveniment.sourceId
				);
				if (capa) carregantCapes[capa.id] = capa.visible;
			});
			mapa.on('sourcedata', (esdeveniment) => {
				const capa = capes.find(
					(capaActual) =>
						capaActual.tipus === 'raster' &&
						identificarFont(capaActual.id) === esdeveniment.sourceId
				);
				if (capa) carregantCapes[capa.id] = capa.visible && !esdeveniment.isSourceLoaded;
			});
			mapa.on('error', (esdeveniment) => {
				const capa = capes.find(
					(capaActual) =>
						capaActual.tipus === 'raster' &&
						'sourceId' in esdeveniment &&
						identificarFont(capaActual.id) === esdeveniment.sourceId
				);
				if (capa) {
					errorsCapes[capa.id] = 'Han fallat algunes imatges. La vista pot ser incompleta.';
				} else {
					errorMapa =
						'S’ha produït un error al mapa base o als seus recursos. Prova un altre mapa base o recarrega la pàgina.';
				}
			});
			const limits = new LimitsGeografics();
			for (const punt of puntsProva.features) {
				const finestra = new FinestraMapa({ offset: 25, closeButton: false });
				finestra.setText(`${punt.properties.nom}: ${punt.properties.descripcio}`);
				const marcador = new MarcadorMapLibre({ color: '#166534' });
				marcador.setLngLat([punt.geometry.coordinates[0], punt.geometry.coordinates[1]]);
				marcador.setPopup(finestra);
				marcador.addTo(mapa);
				marcador.getElement().setAttribute('aria-label', `Punt de prova: ${punt.properties.nom}`);
				marcadors.push(marcador);
				limits.extend([punt.geometry.coordinates[0], punt.geometry.coordinates[1]]);
			}
			if (!limits.isEmpty()) mapa.fitBounds(limits, { padding: 60, maxZoom: 7.5, duration: 0 });
			observadorMida = new ResizeObserver(() => mapa?.resize());
			observadorMida.observe(contenidorMapa);
		} catch {
			errorMapa =
				'No s’ha pogut iniciar el mapa. Comprova la compatibilitat WebGL del navegador i recarrega la pàgina.';
		}
		carregarCataleg();
		return () => {
			componentActiu = false;
			estilPreparat = false;
			controladorCataleg?.abort();
			observadorMida?.disconnect();
			for (const marcador of marcadors) marcador.remove();
			marcadors.length = 0;
			mapa?.remove();
			mapa = undefined;
		};
	});
</script>

<div class="visor">
	<div class="zona-mapa">
		{#if errorMapa}<p class="error-mapa" role="alert">{errorMapa}</p>{/if}
		<div
			class="mapa"
			bind:this={contenidorMapa}
			role="region"
			aria-label="Mapa interactiu de Catalunya"
		></div>
	</div>
	<MenuCapes
		{capes}
		{baseSeleccionada}
		{carregantCataleg}
		{catalegCarregat}
		{errorCataleg}
		{carregantCapes}
		{errorsCapes}
		onCanviarBase={canviarBase}
		onVisibilitat={establirVisibilitat}
		onOpacitat={establirOpacitat}
		onRestablir={restablirUnaCapa}
		onVisibilitatGlobal={establirVisibilitatGlobal}
		onRestablirTotes={restablirTotes}
		onRecarregar={carregarCataleg}
		onReintentarCapa={reintentarCapa}
	/>
</div>

<style>
	.visor {
		display: grid;
		grid-template-columns: minmax(0, 1fr) 240px;
		gap: 16px;
		min-width: 0;
	}
	.zona-mapa {
		min-width: 0;
		position: relative;
	}
	.mapa {
		width: 100%;
		height: calc(100dvh - 24px);
		min-height: 450px;
		border-radius: 8px;
		overflow: hidden;
	}
	.error-mapa {
		position: absolute;
		z-index: 2;
		top: 12px;
		left: 12px;
		right: 12px;
		padding: 12px;
		margin: 0;
		border: 1px solid #c99c7d;
		border-radius: 6px;
		background: #fff7ed;
		color: #9a3412;
		font-size: 0.85rem;
		line-height: 1.5;
	}
	@media (max-width: 1000px) {
		.mapa {
			height: 70dvh;
		}
	}
	@media (max-width: 700px) {
		.visor {
			grid-template-columns: minmax(0, 1fr);
		}
		.mapa {
			height: 60dvh;
			min-height: 320px;
		}
	}
</style>
