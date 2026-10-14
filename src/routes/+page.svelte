<script>

  import PanellInformacio from '../lib/components/PanellInformacio.svelte';
  import Mapa from '../lib/components/Mapa.svelte';

  const nomProjecte = 'GeoExplora';

</script>

<main>
  <h1>Geo Explora</h1>
  <p>Un visor per a explorar dades geogràfiques de Catalunya.</p>

  <PanellInformacio></PanellInformacio>

  <Mapa></Mapa>
</main>


<style>
  main {
    max-width: 900px;
    margin: 60px auto;
    padding: 24px;
    font-family: Arial, sans-serif;
  }

  h1 {
    color: #166534;
  }

  p {
    color: #475569;
    line-height: 1.6;
  }
</style>

