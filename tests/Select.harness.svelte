<script lang="ts">
	import ThemeProvider from '../src/theme/ThemeProvider.svelte';
	import Select from '../src/components/Select.svelte';

	const fruits = [
		{ value: 'apple', label: 'Apple' },
		{ value: 'banana', label: 'Banana' },
		{ value: 'cherry', label: 'Cherry' },
		{ value: 'date', label: 'Date', disabled: true },
		{ value: 'elder', label: 'Elderberry' }
	];
	const zones = Array.from({ length: 12 }, (_, i) => ({ value: `opt${i + 1}`, label: `Option ${i + 1}` }));

	let fruit = $state<string | null>(null);
	let zone = $state<string | null>(null);
	let offHits = $state(0);
</script>

<ThemeProvider>
	<div style="display: flex; flex-direction: column; gap: 12px; padding: 12px">
		<Select options={zones} value={zone} onchange={(v) => (zone = v)} placeholder="Pick a zone" testid="zone" />
		<Select options={fruits} value={fruit} onchange={(v) => (fruit = v)} placeholder="Pick a fruit" testid="fruit" />
		<Select options={fruits} value="apple" disabled testid="off" onchange={() => offHits++} />
		<div>fruit:{fruit}</div>
		<div>zone:{zone}</div>
		<div>off:{offHits}</div>
	</div>
</ThemeProvider>
