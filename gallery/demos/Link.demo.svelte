<script lang="ts">
	import Link from '../../src/components/Link.svelte';
	let last = $state('none');
</script>

<div style="display: flex; flex-direction: column; gap: 14px">
	<div style="display: flex; flex-direction: row; gap: 16px; align-items: center">
		{#each ['themed', 'secondary', 'info', 'success', 'warning', 'danger'] as const as variant}
			<Link {variant} label={variant} onclick={() => (last = variant)} />
		{/each}
	</div>
	<div style="display: flex; flex-direction: row; gap: 16px; align-items: center">
		<Link size="h-sm" label="Small" onclick={() => (last = 'small')} />
		<Link size="h-md" label="Medium" onclick={() => (last = 'medium')} />
		<Link size="h-lg" label="Large" onclick={() => (last = 'large')} />
		<Link label="Disabled" disabled />
	</div>
	<div style="color: var(--text-secondary)">last clicked: {last}</div>
</div>
