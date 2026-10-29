<script lang="ts">
	import IconButton from '../../src/components/IconButton.svelte';
	let added = $state(0);
	const variants = ['primary', 'secondary', 'themed', 'outline', 'ghost', 'link', 'info', 'success', 'warning', 'danger'] as const;
	const sizes = ['h-sm', 'h-md', 'h-bs', 'h-lg', 'h-xl'] as const;
	const shapes = ['square', 'min', 'modern', 'curved', 'round'] as const;
</script>

<div style="display: flex; flex-direction: column; gap: 12px">
	<div style="display: flex; flex-direction: row; flex-wrap: wrap; gap: 8px">
		{#each variants as v}
			<IconButton variant={v} glyph="+" label={v} onclick={() => added++} />
		{/each}
	</div>
	<div style="display: flex; flex-direction: row; gap: 8px; align-items: center">
		{#each shapes as s}
			<IconButton shape={s} variant="outline" glyph="+" label={s} />
		{/each}
	</div>
	<div style="display: flex; flex-direction: row; gap: 8px; align-items: center">
		{#each sizes as z}
			<IconButton size={z} glyph="✕" label={z} />
		{/each}
	</div>
	<div style="display: flex; flex-direction: row; gap: 8px; align-items: center">
		<IconButton glyph="−" label="Disabled" disabled />
		<IconButton variant="themed" label="Star">
			{#snippet children()}★{/snippet}
		</IconButton>
	</div>
	<div>added: {added}</div>
</div>
