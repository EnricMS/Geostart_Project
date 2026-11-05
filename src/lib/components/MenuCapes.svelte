<script>
	import { cercarCapes } from '../capes.js';
	import ResumCapes from './ResumCapes.svelte';
	/**
	 * @type {{
	 * capes: import('../capes.js').Capa[], baseSeleccionada: 'gris' | 'ortofoto',
	 * carregantCataleg: boolean, catalegCarregat: boolean, errorCataleg: string,
	 * carregantCapes: Record<string, boolean>, errorsCapes: Record<string, string>,
	 * onCanviarBase: (base: 'gris' | 'ortofoto') => void,
	 * onVisibilitat: (id: string, visible: boolean) => void,
	 * onOpacitat: (id: string, opacitat: number) => void,
	 * onRestablir: (id: string) => void,
	 * onVisibilitatGlobal: (visible: boolean) => void,
	 * onRestablirTotes: () => void, onRecarregar: () => void,
	 * onReintentarCapa: (id: string) => void
	 * }}
	 */
	let {
		capes,
		baseSeleccionada,
		carregantCataleg,
		catalegCarregat,
		errorCataleg,
		carregantCapes,
		errorsCapes,
		onCanviarBase,
		onVisibilitat,
		onOpacitat,
		onRestablir,
		onVisibilitatGlobal,
		onRestablirTotes,
		onRecarregar,
		onReintentarCapa
	} = $props();
	let cerca = $state('');
	let capesFiltrades = $derived(cercarCapes(capes, cerca));
</script>

<aside class="menu-capes" aria-label="Controls de capes">
	<details open>
		<summary>Capes visibles</summary>
		<fieldset>
			<legend>Mapa base</legend>
			<label
				><input
					type="radio"
					name="mapa-base"
					checked={baseSeleccionada === 'gris'}
					onchange={() => onCanviarBase('gris')}
				/>Cartografia grisa</label
			>
			<label
				><input
					type="radio"
					name="mapa-base"
					checked={baseSeleccionada === 'ortofoto'}
					onchange={() => onCanviarBase('ortofoto')}
				/>Ortofoto amb topònims</label
			>
		</fieldset>

		<section class="superposades" aria-labelledby="titol-superposades">
			<h2 id="titol-superposades">Capes superposades</h2>
			<label class="cerca" for="cerca-capes">Cerca pel nom</label>
			<input id="cerca-capes" type="search" bind:value={cerca} placeholder="Geologia, punts…" />
			<div class="accions-globals">
				<button type="button" onclick={() => onVisibilitatGlobal(true)}>Mostrar totes</button>
				<button type="button" onclick={() => onVisibilitatGlobal(false)}>Amagar totes</button>
				<button type="button" onclick={onRestablirTotes}>Valors inicials</button>
			</div>
			<p class="nota">
				Aquestes accions afecten totes les capes superposades, també les que la cerca amaga. No
				canvien el mapa base.
			</p>

			<div role="status" class="estat-cataleg">
				{#if carregantCataleg}
					<p>Carregant el catàleg…</p>
				{:else if errorCataleg}
					<p class="error">{errorCataleg}</p>
				{:else if catalegCarregat && !capes.some((capa) => capa.tipus === 'raster')}
					<p>El catàleg és buit. Els punts locals continuen disponibles.</p>
				{/if}
			</div>
			{#if errorCataleg}
				<button type="button" onclick={onRecarregar} disabled={carregantCataleg}
					>Tornar a carregar el catàleg</button
				>
			{/if}

			{#each capesFiltrades as capa (capa.id)}
				<fieldset class="capa">
					<legend>{capa.nom}</legend>
					<label>
						<input
							type="checkbox"
							checked={capa.visible}
							onchange={(esdeveniment) =>
								onVisibilitat(capa.id, esdeveniment.currentTarget.checked)}
						/>
						Mostrar {capa.nom.toLowerCase()}
					</label>
					<label class="etiqueta-opacitat" for={`opacitat-${capa.id}`}
						>Opacitat: {capa.opacitat} %</label
					>
					<input
						id={`opacitat-${capa.id}`}
						type="range"
						min="0"
						max="100"
						step="1"
						value={capa.opacitat}
						disabled={!capa.visible}
						oninput={(esdeveniment) =>
							onOpacitat(capa.id, Number(esdeveniment.currentTarget.value))}
					/>
					<button class="restablir" type="button" onclick={() => onRestablir(capa.id)}
						>Restablir aquesta capa</button
					>
					<div role="status" class="estat-capa">
						{#if !capa.visible}
							<p>Capa desactivada.</p>
						{:else if errorsCapes[capa.id]}
							<p class="error">{errorsCapes[capa.id]}</p>
						{:else if carregantCapes[capa.id]}
							<p>Carregant les imatges…</p>
						{:else if capa.opacitat === 0}
							<p>Capa activada, però transparent.</p>
						{:else}
							<p>Capa activada.</p>
						{/if}
					</div>
					{#if errorsCapes[capa.id] && capa.tipus === 'raster'}
						<button type="button" onclick={() => onReintentarCapa(capa.id)}
							>Reintentar les imatges</button
						>
					{/if}
					<details class="informacio">
						<summary>Informació i font</summary>
						<p>{capa.descripcio}</p>
						{#if capa.tipus === 'raster'}
							<p>Font: {capa.organisme}</p>
							<p class="nota">
								La informació varia segons l’escala. Consulta la llegenda amb opacitat al 100 % per
								evitar colors barrejats amb el fons.
							</p>
							<p>
								<a href={capa.urlInformacio} target="_blank" rel="external noopener noreferrer"
									>Informació de la font ↗</a
								>
							</p>
							<p>
								<a href={capa.urlLlegenda} target="_blank" rel="external noopener noreferrer"
									>Llegenda oficial ↗</a
								>
							</p>
						{/if}
					</details>
				</fieldset>
			{:else}
				<p role="status">No s’han trobat capes amb aquest nom.</p>
			{/each}
			<ResumCapes {capes} />
		</section>
	</details>
</aside>

<style>
	.menu-capes {
		box-sizing: border-box;
		min-width: 0;
		padding: 16px;
		background: #e8efe5;
		border: 1px solid #c4d3be;
		border-radius: 8px;
		align-self: start;
		max-height: calc(100dvh - 24px);
		overflow-y: auto;
		overflow-wrap: anywhere;
		scrollbar-gutter: stable;
	}
	summary {
		font-weight: bold;
		cursor: pointer;
		padding: 4px 0;
	}
	details[open] > summary {
		margin-bottom: 16px;
	}
	fieldset {
		border: 0;
		min-width: 0;
		margin: 0;
		padding: 0;
	}
	legend,
	h2 {
		font-size: 0.95rem;
		font-weight: bold;
		margin-bottom: 12px;
	}
	label {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 0.9rem;
		cursor: pointer;
	}
	label + label {
		margin-top: 12px;
	}
	.superposades {
		margin-top: 24px;
	}
	.cerca {
		margin-bottom: 8px;
	}
	input[type='search'] {
		box-sizing: border-box;
		width: 100%;
		padding: 8px;
		border: 1px solid #829b7b;
		border-radius: 4px;
		background: #f8faf7;
		font: inherit;
	}
	.accions-globals {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		margin-top: 12px;
	}
	button {
		font: inherit;
		font-size: 0.8rem;
		padding: 7px 9px;
		border: 1px solid #829b7b;
		border-radius: 5px;
		background: #f1f5ef;
		color: #166534;
		cursor: pointer;
	}
	button:hover {
		background: #d7e5d1;
	}
	button:disabled {
		cursor: wait;
		opacity: 0.6;
	}
	button:focus-visible,
	input:focus-visible,
	summary:focus-visible,
	a:focus-visible {
		outline: 3px solid #166534;
		outline-offset: 3px;
	}
	input {
		accent-color: #166534;
	}
	.capa {
		border-top: 1px solid #c4d3be;
		margin-top: 20px;
		padding-top: 12px;
	}
	.capa legend {
		padding-top: 12px;
	}
	.etiqueta-opacitat {
		margin-top: 14px;
	}
	input[type='range'] {
		width: 100%;
		display: block;
		margin: 10px 0 14px;
	}
	.estat-capa,
	.estat-cataleg,
	.informacio {
		font-size: 0.85rem;
		line-height: 1.5;
	}
	.nota {
		font-size: 0.8rem;
		color: #475569;
		line-height: 1.5;
	}
	.error {
		color: #9a3412;
	}
	a {
		color: #166534;
		text-decoration: underline;
	}
	.informacio {
		margin-top: 12px;
	}
	@media (max-width: 700px) {
		.menu-capes {
			max-height: none;
		}
	}
</style>
