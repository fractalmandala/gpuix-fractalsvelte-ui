<script lang="ts">
	import Button from '../../src/components/Button.svelte';
	let clicks = $state(0);
	const variants = ['primary', 'secondary', 'themed', 'outline', 'ghost', 'link', 'info', 'success', 'warning', 'danger'] as const;
	const shapes = ['square', 'min', 'modern', 'curved', 'round'] as const;
	const sizes = ['h-sm', 'h-md', 'h-bs', 'h-lg', 'h-xl'] as const;

</script>

{#snippet plus()}<div>+</div>{/snippet}
{#snippet arrow()}<div>→</div>{/snippet}

<div style="display: flex; flex-direction: column; gap: 20px">
	<div style="display: flex; flex-direction: row; flex-wrap: wrap; gap: 8px">
		{#each variants as v}
			<Button variant={v} label={v} onclick={() => clicks++} />
		{/each}
	</div>
	<div style="display: flex; flex-direction: row; gap: 8px; align-items: center">
		{#each shapes as s}
			<Button shape={s} label={s} />
		{/each}
	</div>
	<div style="display: flex; flex-direction: row; gap: 8px; align-items: center">
		{#each sizes as z}
			<Button size={z} label={z} />
		{/each}
	</div>
	<div style="display: flex; flex-direction: row; gap: 8px; align-items: center">
		<Button label="Save" leading={plus} />
		<Button label="Next" trailing={arrow} />
		<Button label="Full width" full />
	</div>
	<div style="display: flex; flex-direction: row; gap: 8px; align-items: center">
		<Button label="Disabled" disabled />
		<Button label="Loading" loading />
	</div>
	<div>clicks: {clicks}</div>
</div>
