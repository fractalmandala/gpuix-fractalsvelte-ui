<script lang="ts">
	import Badge from '../src/components/Badge.svelte';
	import Button from '../src/components/Button.svelte';
	let count = $state(0);
</script>

<div style="display: flex; flex-direction: column; gap: 12px; padding: 16px">
	<div style="display: flex; flex-direction: row; gap: 8px; align-items: center">
		<Button label="Add" size="h-md" variant="outline" testid="add" onclick={() => count++} />
		<Badge label="new {count}" variant="danger" testid="count" />
		<Badge label="Draft" size="sm" testid="sm" />
		<Badge label="Draft" size="md" testid="md" />
	</div>
	<div style="display: flex; flex-direction: row; gap: 8px; align-items: center">
		{#each ['secondary', 'info', 'success', 'warning', 'danger'] as const as variant}
			<Badge {variant} label={variant} />
		{/each}
	</div>
</div>
