<script>
	import icona from '#lib/assets/favicon.svg';

	/** @type {{children: import('svelte').Snippet}} */
	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" type="image/svg+xml" href={icona} />
</svelte:head>

{@render children()}
