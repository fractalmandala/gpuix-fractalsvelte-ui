<script lang="ts">
	import ThemeProvider from '../src/theme/ThemeProvider.svelte';
	import Tabs from '../src/components/Tabs.svelte';
	const items = [
		{ id: 'overview', label: 'Overview' },
		{ id: 'activity', label: 'Activity' },
		{ id: 'billing', label: 'Billing', disabled: true },
		{ id: 'settings', label: 'Settings' }
	];
	let value = $state('overview');
	let pill = $state('one');
	const pills = [
		{ id: 'one', label: 'Day' },
		{ id: 'two', label: 'Week' },
		{ id: 'three', label: 'Month' }
	];
</script>

<ThemeProvider>
	<div style="display: flex; flex-direction: column; gap: 16px; padding: 16px">
		<Tabs {items} {value} testid="tabs" onchange={(id) => (value = id)}>
			{#snippet children(id)}<div testId="panel">panel:{id}</div>{/snippet}
		</Tabs>
		<Tabs items={pills} value={pill} variant="pill" size="sm" testid="pills" onchange={(id) => (pill = id)} />
		<div testId="state">{`value:${value} pill:${pill}`}</div>
	</div>
</ThemeProvider>
