<script>
  import { onMount } from 'svelte';
  import rutaWorker from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
  import 'maplibre-gl/dist/maplibre-gl.css';
  import {
  Map as MapaMapLibre,
  Marker as MarcadorMapLibre,
  Popup as FinestraMapa,
  setWorkerUrl as establirRutaWorker
} from 'maplibre-gl';
  import puntProva from '../dades/puntProva.json';

  /** @type {HTMLDivElement} */
  let contenidorMapa;

  onMount(() => {
    establirRutaWorker(rutaWorker);

    const mapa = new MapaMapLibre({
      container: contenidorMapa,
      style: 'https://demotiles.maplibre.org/style.json',
      center: [2, 41.8],
      zoom: 7
    });

const finestra = new FinestraMapa({
  offset: 25,
  closeButton: false
});

finestra.setText(
  `${puntProva.properties.nom}: ${puntProva.properties.descripcio}`
);

const marcador = new MarcadorMapLibre({
  color: '#166534'
});

marcador.setLngLat([
  puntProva.geometry.coordinates[0],
  puntProva.geometry.coordinates[1]
]);
marcador.setPopup(finestra);
marcador.addTo(mapa);

    return () => {
      mapa.remove();
    };
  });
</script>

<div
  class="mapa"
  bind:this={contenidorMapa}
  role="region"
  aria-label="Mapa interactiu de Catalunya"
></div>

<style>
  .mapa {
    width: 100%;
    height: 650px;
    margin-top: 24px;
    border-radius: 8px;
    overflow: hidden;
  }
</style>
