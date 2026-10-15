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

	/** @type {HTMLDivElement} */
	let contenidorMapa;
	let mostrarPunts = $state(true);
	let mostrarGeologia = $state(false);
	let carregantGeologia = $state(false);
	let errorGeologia = $state('');
	let opacitatGeologia = $state(70);
	let baseSeleccionada = $state('gris');

	/**
	 * @type {{
	 *   id: string,
	 *   nom: string,
	 *   descripcio: string,
	 *   organisme: string,
	 *   urlTesselles: string,
	 *   atribucio: string,
	 *   urlLlegenda: string,
	 *   urlInformacio: string
	 * }[]}
	 */
	let catalegCapes = $state([]);

	let carregantCataleg = $state(true);
	let errorCataleg = $state('');

	/** @type {MapaMapLibre | undefined} */
	let mapa;
	let estilPreparat = false;

	const estilsBase = {
		gris: 'https://geoserveis.icgc.cat/styles/mapa-base-estandard-gris.json',
		ortofoto: 'https://geoserveis.icgc.cat/styles/mapa-base-orto-hibrida.json'
	};

	/** @type {MarcadorMapLibre[]} */
	const marcadors = [];

	function alternarPunts() {
		mostrarPunts = !mostrarPunts;

		for (const marcador of marcadors) {
			marcador.getElement().style.display = mostrarPunts ? '' : 'none';

			if (!mostrarPunts) {
				marcador.getPopup()?.remove();
			}
		}
	}

	/** @param {'gris' | 'ortofoto'} base */
	function canviarBase(base) {
		if (!mapa) {
			return;
		}

		baseSeleccionada = base;
		errorGeologia = '';
		carregantGeologia = mostrarGeologia;
		estilPreparat = false;
		mapa.setStyle(estilsBase[base], { diff: false });
	}

	function prepararGeologia() {
		if (!mapa || !estilPreparat) {
			return;
		}

		const capaGeologia = catalegCapes.find((capa) => capa.id === 'geologia-general');

		if (!capaGeologia) {
			return;
		}

		if (!mapa.getSource('font-geologia')) {
			mapa.addSource('font-geologia', {
				type: 'raster',
				tiles: [capaGeologia.urlTesselles],
				tileSize: 256,
				attribution: capaGeologia.atribucio
			});
		}

		if (!mapa.getLayer('capa-geologia')) {
			mapa.addLayer({
				id: 'capa-geologia',
				type: 'raster',
				source: 'font-geologia',
				layout: {
					visibility: mostrarGeologia ? 'visible' : 'none'
				},
				paint: {
					'raster-opacity': opacitatGeologia / 100
				}
			});
		}
	}

	function alternarGeologia() {
		mostrarGeologia = !mostrarGeologia;
		errorGeologia = '';
		carregantGeologia = mostrarGeologia;

		if (mapa?.getLayer('capa-geologia')) {
			mapa.setLayoutProperty('capa-geologia', 'visibility', mostrarGeologia ? 'visible' : 'none');
			carregantGeologia = mostrarGeologia && !mapa.isSourceLoaded('font-geologia');
		}
	}

	/** @param {number} percentatge */
	function canviarOpacitatGeologia(percentatge) {
		opacitatGeologia = percentatge;

		if (mapa?.getLayer('capa-geologia')) {
			mapa.setPaintProperty('capa-geologia', 'raster-opacity', percentatge / 100);
		}
	}

	async function carregarCataleg() {
		carregantCataleg = true;
		errorCataleg = '';

		try {
			const resposta = await fetch('/api/capes');

			if (!resposta.ok) {
				throw new Error('No s’ha pogut carregar el catàleg de capes.');
			}

			catalegCapes = await resposta.json();
			prepararGeologia();
		} catch {
			errorCataleg = 'No s’ha pogut carregar el catàleg de capes.';
		} finally {
			carregantCataleg = false;
		}
	}

	onMount(() => {
		carregarCataleg();
		establirRutaWorker(rutaWorker);

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

		mapa.on('sourcedataloading', (esdeveniment) => {
			if (esdeveniment.sourceId === 'font-geologia' && mostrarGeologia) {
				carregantGeologia = true;
			}
		});

		mapa.on('sourcedata', (esdeveniment) => {
			if (esdeveniment.sourceId === 'font-geologia') {
				carregantGeologia = mostrarGeologia && !esdeveniment.isSourceLoaded;
			}
		});

		mapa.on('error', (esdeveniment) => {
			if ('sourceId' in esdeveniment && esdeveniment.sourceId === 'font-geologia') {
				errorGeologia =
					'No s’han pogut carregar algunes imatges de la geologia. La vista pot ser incompleta.';
			}
		});

		mapa.on('style.load', () => {
			estilPreparat = true;
			prepararGeologia();
		});

		const limits = new LimitsGeografics();

		for (const puntProva of puntsProva.features) {
			const finestra = new FinestraMapa({
				offset: 25,
				closeButton: false
			});

			finestra.setText(`${puntProva.properties.nom}: ${puntProva.properties.descripcio}`);

			const marcador = new MarcadorMapLibre({
				color: '#166534'
			});

			marcador.setLngLat([puntProva.geometry.coordinates[0], puntProva.geometry.coordinates[1]]);
			marcador.setPopup(finestra);
			marcador.addTo(mapa);
			marcadors.push(marcador);
			limits.extend([puntProva.geometry.coordinates[0], puntProva.geometry.coordinates[1]]);
		}

		if (!limits.isEmpty()) {
			mapa.fitBounds(limits, {
				padding: 60,
				maxZoom: 7.5,
				duration: 0
			});
		}

		const observadorMida = new ResizeObserver(() => {
			mapa?.resize();
		});
		observadorMida.observe(contenidorMapa);

		return () => {
			estilPreparat = false;
			observadorMida.disconnect();
			for (const marcador of marcadors) {
				marcador.remove();
			}

			marcadors.length = 0;
			mapa?.remove();
			mapa = undefined;
		};
	});
</script>

<div class="visor">
	<div
		class="mapa"
		bind:this={contenidorMapa}
		role="region"
		aria-label="Mapa interactiu de Catalunya"
	></div>

	<aside class="menu-capes" aria-label="Controls de capes">
		<details open>
			<summary>Capes visibles</summary>
			<fieldset>
				<legend class="nom-grup">Mapa base</legend>

				<label>
					<input
						type="radio"
						name="mapa-base"
						checked={baseSeleccionada === 'gris'}
						onchange={() => canviarBase('gris')}
					/>
					Cartografia grisa
				</label>

				<label>
					<input
						type="radio"
						name="mapa-base"
						checked={baseSeleccionada === 'ortofoto'}
						onchange={() => canviarBase('ortofoto')}
					/>
					Ortofoto amb topònims
				</label>
			</fieldset>

			<fieldset>
				<legend class="nom-grup">Geologia</legend>

				<label>
					<input type="checkbox" checked={mostrarGeologia} onchange={alternarGeologia} />
					Mapa geològic general
				</label>
				<p class="avis-geologia">
					La informació varia segons l’escala. Amb opacitat reduïda, els colors es barregen amb el
					fons; consulta la llegenda al 100 %.
				</p>
				<div class="estat-capa" role="status">
					{#if !mostrarGeologia}
						<p>Capa desactivada.</p>
					{:else if errorCataleg}
						<p class="error-capa">La geologia no està disponible: no s’ha carregat el catàleg.</p>
					{:else if errorGeologia}
						<p class="error-capa">{errorGeologia}</p>
					{:else if carregantCataleg}
						<p>Esperant el catàleg de capes…</p>
					{:else if carregantGeologia}
						<p>Carregant la capa geològica…</p>
					{:else}
						<p>Capa activada.</p>
					{/if}
				</div>
				<div class="control-opacitat">
					<label for="opacitat-geologia">
						Opacitat: {opacitatGeologia} %
					</label>

					<input
						id="opacitat-geologia"
						type="range"
						min="0"
						max="100"
						step="1"
						value={opacitatGeologia}
						disabled={!mostrarGeologia}
						oninput={(esdeveniment) =>
							canviarOpacitatGeologia(Number(esdeveniment.currentTarget.value))}
					/>
				</div>

				<div class="informacio-capes" aria-live="polite">
					{#if carregantCataleg}
						<p>Carregant informació de les capes…</p>
					{:else if errorCataleg}
						<p>{errorCataleg}</p>
						<button type="button" onclick={carregarCataleg}> Tornar-ho a provar </button>
					{:else}
						{#each catalegCapes as capa (capa.id)}
							<article>
								<h3>{capa.nom}</h3>
								<p>{capa.descripcio}</p>
								<p>Font: {capa.organisme}</p>
								<a href={capa.urlInformacio} target="_blank" rel="external noopener noreferrer">
									Informació de la font (pestanya nova)
								</a>
								<p>
									<a href={capa.urlLlegenda} target="_blank" rel="external noopener noreferrer"
										>Llegenda oficial del servei (pestanya nova)</a
									>
								</p>
							</article>
						{/each}
					{/if}
				</div>
			</fieldset>

			<fieldset>
				<legend class="nom-grup">Punts</legend>

				<label>
					<input type="checkbox" checked={mostrarPunts} onchange={alternarPunts} />
					Mostrar punts de prova
				</label>
				<p class="avis-geologia">Coordenades aproximades de ciutats, sense valor d’inventari.</p>
			</fieldset>
		</details>
	</aside>
</div>

<style>
	.visor {
		display: grid;
		grid-template-columns: minmax(0, 1fr) 200px;
		gap: 16px;
		min-width: 0;
	}

	.mapa {
		width: 100%;
		height: calc(100dvh - 24px);
		min-height: 450px;
		border-radius: 8px;
		overflow: hidden;
	}

	.menu-capes {
		min-width: 0;
		padding: 16px;
		background-color: #e8efe5;
		border: 1px solid #c4d3be;
		border-radius: 8px;
		align-self: start;
	}

	@media (max-width: 1000px) {
		.mapa {
			height: 70dvh;
		}
	}

	fieldset {
		min-width: 0;
		margin: 0;
		padding: 0;
		border: none;
	}

	legend {
		margin-bottom: 16px;
		font-weight: bold;
	}

	label {
		display: flex;
		align-items: center;
		gap: 8px;
		cursor: pointer;
	}

	.control-opacitat {
		margin-top: 16px;
	}

	.estat-capa {
		font-size: 0.85rem;
		line-height: 1.5;
		color: #475569;
	}

	.avis-geologia {
		font-size: 0.8rem;
		line-height: 1.5;
		color: #475569;
	}

	.error-capa {
		color: #9a3412;
	}

	.control-opacitat input {
		display: block;
		width: 100%;
		margin: 12px 0 0;
		accent-color: #166534;
	}
	@media (max-width: 700px) {
		.visor {
			grid-template-columns: 1fr;
		}

		.mapa {
			height: 60dvh;
			min-height: 320px;
		}
	}

	summary {
		padding: 4px 0;
		font-weight: bold;
		cursor: pointer;
	}

	summary:focus-visible {
		outline: 3px solid #166534;
		outline-offset: 3px;
	}

	details[open] summary {
		margin-bottom: 16px;
	}

	.nom-grup {
		font-size: 0.9rem;
		color: #475569;
	}

	fieldset + fieldset {
		margin-top: 24px;
	}

	label + label {
		margin-top: 12px;
	}

	.informacio-capes {
		margin-top: 20px;
		font-size: 0.85rem;
		line-height: 1.5;
		overflow-wrap: anywhere;
	}

	.informacio-capes h3 {
		font-size: 0.95rem;
	}

	.informacio-capes a {
		color: #166534;
		text-decoration: underline;
	}
</style>
