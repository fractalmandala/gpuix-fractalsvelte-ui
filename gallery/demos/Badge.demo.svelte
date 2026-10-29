<script lang="ts">
	import Badge from '../../src/components/Badge.svelte';
	const VARIANTS = ['secondary', 'info', 'success', 'warning', 'danger'] as const;
</script>

<div style="display: flex; flex-direction: column; gap: 12px">
	<div style="display: flex; flex-direction: row; gap: 8px; align-items: center">
		{#each VARIANTS as variant}
			<Badge {variant} label={variant} />
		{/each}
	</div>
	<div style="display: flex; flex-direction: row; gap: 8px; align-items: center">
		<Badge size="sm" label="Small" />
		<Badge size="md" label="Medium" />
		<Badge variant="success" label="Live" />
		<Badge variant="danger" label="3 errors" />
	</div>
</div>
