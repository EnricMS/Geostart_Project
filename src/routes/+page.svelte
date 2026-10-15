<script>
	import PanellInformacio from '../lib/components/PanellInformacio.svelte';
	import Mapa from '../lib/components/Mapa.svelte';

	const nomProjecte = 'GeoExplora';
</script>

<svelte:head>
	<title>GeoExplora | Visor cartogràfic i geològic</title>
	<meta
		name="description"
		content="Explora Catalunya amb cartografia i ortofoto de l’ICGC, una capa geològica amb opacitat ajustable i punts GeoJSON."
	/>
</svelte:head>

<main>
	<aside class="presentacio" aria-label="Informació del projecte">
		<h1>{nomProjecte}</h1>
		<p>Un visor per a explorar dades geogràfiques de Catalunya.</p>
		<PanellInformacio />
	</aside>

	<Mapa></Mapa>
</main>

<style>
	:global(body) {
		margin: 0;
		background-color: #f1f5ef;
		color: #24352a;
		font-family: Arial, sans-serif;
	}

	main {
		display: grid;
		grid-template-columns: 220px minmax(0, 1fr);
		gap: 16px;
		padding: 12px;
		align-items: start;
	}

	.presentacio {
		min-width: 0;
		overflow-wrap: anywhere;
	}

	h1 {
		margin-top: 0;
		color: #166534;
	}

	p {
		color: #475569;
		line-height: 1.6;
	}

	@media (max-width: 1000px) {
		main {
			grid-template-columns: minmax(0, 1fr);
		}
	}
</style>
