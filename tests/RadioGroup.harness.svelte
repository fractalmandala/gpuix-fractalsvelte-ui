<script lang="ts">
	import ThemeProvider from '../src/theme/ThemeProvider.svelte';
	import RadioGroup from '../src/components/RadioGroup.svelte';

	const plans = [
		{ value: 'monthly', label: 'Monthly' },
		{ value: 'yearly', label: 'Yearly' },
		{ value: 'lifetime', label: 'Lifetime', disabled: true }
	];
	const views = [
		{ value: 'list', label: 'List' },
		{ value: 'grid', label: 'Grid' },
		{ value: 'board', label: 'Board' }
	];
	let plan = $state<string | null>('monthly');
	let view = $state<string | null>('list');
	let offHits = $state(0);
</script>

<ThemeProvider>
	<div style="display: flex; flex-direction: column; gap: 16px; padding: 16px">
		<div style="display: flex; flex-direction: row; gap: 48px">
			<RadioGroup options={plans} value={plan} onchange={(v) => (plan = v)} testid="plan" />
			<RadioGroup options={views} value={view} direction="row" onchange={(v) => (view = v)} testid="view" />
		</div>
		<RadioGroup options={plans} value="yearly" disabled testid="off" onchange={() => offHits++} />
		<div>plan:{plan}</div>
		<div>view:{view}</div>
		<div>off:{offHits}</div>
	</div>
</ThemeProvider>
