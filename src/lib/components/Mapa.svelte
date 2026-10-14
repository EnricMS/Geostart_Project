<script>
  import { onMount } from 'svelte';
  import { Map as MapaMapLibre, setWorkerUrl as establirRutaWorker } from 'maplibre-gl';
  import rutaWorker from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
  import 'maplibre-gl/dist/maplibre-gl.css';

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
