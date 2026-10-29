<script lang="ts">
	import IconButton from '../../src/components/IconButton.svelte';
	let added = $state(0);
</script>

<div style="display: flex; flex-direction: column; gap: 12px">
	{#each ['solid', 'soft', 'outline', 'ghost'] as const as variant}
		<div style="display: flex; flex-direction: row; gap: 8px; align-items: center">
			{#each ['accent', 'neutral', 'success', 'warn', 'danger'] as const as tone}
				<IconButton {variant} {tone} glyph="+" label={tone} onclick={() => added++} />
			{/each}
		</div>
	{/each}
	<div style="display: flex; flex-direction: row; gap: 8px; align-items: center">
		<IconButton size="sm" glyph="✕" label="Small" />
		<IconButton size="md" glyph="✕" label="Medium" />
		<IconButton size="lg" glyph="✕" label="Large" />
		<IconButton glyph="−" label="Disabled" disabled />
		<IconButton variant="soft" tone="accent" label="Star">
			{#snippet children()}★{/snippet}
		</IconButton>
	</div>
	<div style="color: var(--ui-ink-muted)">added: {added}</div>
</div>
