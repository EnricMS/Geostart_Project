<script>
	/** @type {{ capes: import('../capes.js').Capa[] }} */
	let { capes } = $props();
	let capesVisibles = $derived(capes.filter((capa) => capa.visible));
	let capesAmbOpacitat = $derived(capesVisibles.filter((capa) => capa.opacitat > 0));
	let nomsPerceptibles = $derived(capesAmbOpacitat.map((capa) => capa.nom));
</script>

<section class="resum" aria-label="Resum de capes superposades">
	<h3>Resum de la selecció</h3>
	<p aria-live="polite">
		Activades: <strong>{capesVisibles.length} / {capes.length}</strong><br />
		Amb opacitat superior a zero: <strong>{capesAmbOpacitat.length}</strong>
	</p>
	{#if nomsPerceptibles.length > 0}
		<p>{nomsPerceptibles.join(' · ')}</p>
	{/if}
	<p class="nota">El resum reflecteix la selecció; la càrrega de dades s’indica a cada capa.</p>
</section>

<style>
	.resum {
		border-top: 1px solid #c4d3be;
		margin-top: 20px;
		padding-top: 16px;
	}
	h3 {
		margin: 0;
		font-size: 0.95rem;
	}
	p {
		line-height: 1.5;
		font-size: 0.85rem;
	}
	.nota {
		color: #475569;
		font-size: 0.8rem;
	}
</style>
