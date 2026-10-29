<script lang="ts">
	import Tabs from '../../src/components/Tabs.svelte';
	let line = $state('overview');
	let pill = $state('day');
	let small = $state('code');
	const items = [
		{ id: 'overview', label: 'Overview' },
		{ id: 'activity', label: 'Activity' },
		{ id: 'billing', label: 'Billing', disabled: true },
		{ id: 'settings', label: 'Settings' }
	];
	const periods = [
		{ id: 'day', label: 'Day' },
		{ id: 'week', label: 'Week' },
		{ id: 'month', label: 'Month' }
	];
</script>

<div style="display: flex; flex-direction: column; gap: 24px; width: 420px">
	<Tabs {items} value={line} onchange={(id) => (line = id)}>
		{#snippet children(id)}<div style="color: var(--ui-ink-muted)">Showing {id}.</div>{/snippet}
	</Tabs>
	<div style="display: flex; flex-direction: row; gap: 16px; align-items: center">
		<Tabs items={periods} value={pill} variant="pill" onchange={(id) => (pill = id)} />
		<Tabs items={periods} value={small} variant="pill" size="sm" onchange={(id) => (small = id)} />
	</div>
</div>
