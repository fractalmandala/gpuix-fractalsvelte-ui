<script lang="ts">
	import RadioGroup from '../../src/components/RadioGroup.svelte';
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
	let view = $state<string | null>('grid');
</script>

<div style="display: flex; flex-direction: column; gap: 20px; padding: 8px">
	<div style="display: flex; flex-direction: row; gap: 48px; align-items: start">
		<div style="display: flex; flex-direction: column; gap: 8px">
			<div style="color: var(--text-secondary); font-size: var(--text-sm)">Column · md · one disabled option</div>
			<RadioGroup options={plans} value={plan} onchange={(v) => (plan = v)} />
		</div>
		<div style="display: flex; flex-direction: column; gap: 8px">
			<div style="color: var(--text-secondary); font-size: var(--text-sm)">Sizes</div>
			<RadioGroup options={plans.slice(0, 2)} value={plan} size="h-sm" onchange={(v) => (plan = v)} />
			<RadioGroup options={plans.slice(0, 2)} value={plan} size="h-bs" onchange={(v) => (plan = v)} />
		</div>
	</div>
	<div style="display: flex; flex-direction: column; gap: 8px">
		<div style="color: var(--text-secondary); font-size: var(--text-sm)">Row</div>
		<RadioGroup options={views} value={view} direction="row" onchange={(v) => (view = v)} />
	</div>
	<div style="display: flex; flex-direction: column; gap: 8px">
		<div style="color: var(--text-secondary); font-size: var(--text-sm)">Disabled group</div>
		<RadioGroup options={views} value="list" direction="row" disabled />
	</div>
	<div style="color: var(--text-secondary)">plan: {plan} · view: {view}</div>
</div>
