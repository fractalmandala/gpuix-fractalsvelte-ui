<script lang="ts">
	import Link from '../../src/components/Link.svelte';
	let last = $state('none');
</script>

<div style="display: flex; flex-direction: column; gap: 14px">
	<div style="display: flex; flex-direction: row; gap: 16px; align-items: center">
		{#each ['accent', 'neutral', 'success', 'warn', 'danger'] as const as tone}
			<Link {tone} label={tone} onclick={() => (last = tone)} />
		{/each}
	</div>
	<div style="display: flex; flex-direction: row; gap: 16px; align-items: center">
		<Link size="sm" label="Small" onclick={() => (last = 'small')} />
		<Link size="md" label="Medium" onclick={() => (last = 'medium')} />
		<Link size="lg" label="Large" onclick={() => (last = 'large')} />
		<Link label="Disabled" disabled />
	</div>
	<div style="color: var(--ui-ink-muted)">last clicked: {last}</div>
</div>
