<script lang="ts">
	import Spinner from '../../src/components/Spinner.svelte';
	const VARIANTS = ['themed', 'secondary', 'success', 'warning', 'danger'] as const;
</script>

<div style="display: flex; flex-direction: column; gap: 16px">
	<div style="display: flex; flex-direction: row; gap: 20px; align-items: center">
		<Spinner size="h-sm" />
		<Spinner size="h-md" />
		<Spinner size="h-lg" />
	</div>
	<div style="display: flex; flex-direction: row; gap: 20px; align-items: center">
		{#each VARIANTS as variant}
			<Spinner {variant} size="h-lg" />
		{/each}
	</div>
</div>
