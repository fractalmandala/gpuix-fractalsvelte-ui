<script lang="ts">
	import Select from '../../src/components/Select.svelte';

	const fruits = [
		{ value: 'apple', label: 'Apple' },
		{ value: 'banana', label: 'Banana' },
		{ value: 'cherry', label: 'Cherry' },
		{ value: 'date', label: 'Date', disabled: true },
		{ value: 'elder', label: 'Elderberry' }
	];
	const zones = Array.from({ length: 24 }, (_, i) => ({ value: `z${i + 1}`, label: `Zone ${i + 1}` }));

	let fruit = $state<string | null>(null);
	let zone = $state<string | null>('z3');
</script>

<div style="display: flex; flex-direction: column; gap: 16px; padding: 8px">
	<div style="display: flex; flex-direction: row; gap: 12px; align-items: center">
		<Select options={fruits} value={fruit} onchange={(v) => (fruit = v)} placeholder="Pick a fruit" size="h-md" />
		<Select options={fruits} value={fruit} onchange={(v) => (fruit = v)} placeholder="Pick a fruit" />
		<Select options={fruits} value={fruit} onchange={(v) => (fruit = v)} placeholder="Pick a fruit" size="h-xl" />
	</div>
	<div style="display: flex; flex-direction: row; gap: 12px; align-items: center">
		<Select options={fruits} value="banana" disabled />
		<Select options={zones} value={zone} onchange={(v) => (zone = v)} placeholder="Long list" />
	</div>
	<div style="color: var(--text-secondary)">fruit: {fruit ?? 'none'} · zone: {zone ?? 'none'}</div>
</div>
