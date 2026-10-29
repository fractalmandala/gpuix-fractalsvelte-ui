<script lang="ts">
	import Badge from '../../src/components/Badge.svelte';
	const TONES = ['accent', 'neutral', 'success', 'warn', 'danger'] as const;
</script>

<div style="display: flex; flex-direction: column; gap: 12px">
	{#each ['solid', 'soft', 'outline'] as const as variant}
		<div style="display: flex; flex-direction: row; gap: 8px; align-items: center">
			{#each TONES as tone}
				<Badge {variant} {tone} label={tone} />
			{/each}
		</div>
	{/each}
	<div style="display: flex; flex-direction: row; gap: 8px; align-items: center">
		<Badge size="sm" label="Small" />
		<Badge size="md" label="Medium" />
		<Badge tone="success" variant="solid" label="Live" />
		<Badge tone="danger" variant="outline" label="3 errors" />
	</div>
</div>
