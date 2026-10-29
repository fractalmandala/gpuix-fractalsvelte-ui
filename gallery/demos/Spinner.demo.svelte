<script lang="ts">
	import Spinner from '../../src/components/Spinner.svelte';
	const TONES = ['accent', 'neutral', 'success', 'warn', 'danger'] as const;
</script>

<div style="display: flex; flex-direction: column; gap: 16px">
	<div style="display: flex; flex-direction: row; gap: 20px; align-items: center">
		<Spinner size="sm" />
		<Spinner size="md" />
		<Spinner size="lg" />
	</div>
	<div style="display: flex; flex-direction: row; gap: 20px; align-items: center">
		{#each TONES as tone}
			<Spinner {tone} size="lg" />
		{/each}
	</div>
</div>
