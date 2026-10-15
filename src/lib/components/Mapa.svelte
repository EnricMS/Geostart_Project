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
	let baseSeleccionada = $state('gris');

	/** @type {MapaMapLibre | undefined} */
	let mapa;

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
		mapa.setStyle(estilsBase[base]);
	}

	onMount(() => {
		establirRutaWorker(rutaWorker);

		mapa = new MapaMapLibre({
			container: contenidorMapa,
			style: estilsBase.gris,
			center: [2, 41.8],
			zoom: 7
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
				<legend class="nom-grup">Punts</legend>

				<label>
					<input type="checkbox" checked={mostrarPunts} onchange={alternarPunts} />
					Mostrar punts de prova
				</label>
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
</style>
