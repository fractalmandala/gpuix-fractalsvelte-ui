<script lang="ts">
	import ThemeProvider from '../src/theme/ThemeProvider.svelte';
	import Badge from '../src/components/Badge.svelte';
	import Button from '../src/components/Button.svelte';
	let count = $state(0);
</script>

<ThemeProvider>
	<div style="display: flex; flex-direction: column; gap: 12px; padding: 16px">
		<div style="display: flex; flex-direction: row; gap: 8px; align-items: center">
			<Button label="Add" size="sm" variant="outline" tone="neutral" testid="add" onclick={() => count++} />
			<Badge label="new {count}" tone="danger" variant="solid" testid="count" />
			<Badge label="Draft" size="sm" testid="sm" />
			<Badge label="Draft" size="md" testid="md" />
		</div>
		{#each ['solid', 'soft', 'outline'] as const as variant}
			<div style="display: flex; flex-direction: row; gap: 8px; align-items: center">
				{#each ['accent', 'neutral', 'success', 'warn', 'danger'] as const as tone}
					<Badge {variant} {tone} label={tone} />
				{/each}
			</div>
		{/each}
	</div>
</ThemeProvider>
