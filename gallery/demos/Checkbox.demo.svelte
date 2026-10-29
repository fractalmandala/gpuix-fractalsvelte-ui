<script lang="ts">
	import Checkbox from '../../src/components/Checkbox.svelte';

	let items = $state([true, false, true]);
	const all = $derived(items.every(Boolean));
	const some = $derived(items.some(Boolean) && !all);
	let terms = $state(false);
</script>

<div style="display: flex; flex-direction: row; gap: 48px">
	<div style="display: flex; flex-direction: column; gap: 12px">
		<Checkbox label="Small" size="sm" checked />
		<Checkbox label="Medium" checked={terms} onchange={(v) => (terms = v)} />
		<Checkbox label="Large" size="lg" checked />
		<Checkbox label="Indeterminate" indeterminate />
		<Checkbox label="Disabled" disabled />
		<Checkbox label="Disabled checked" disabled checked />
	</div>

	<div style="display: flex; flex-direction: column; gap: 12px">
		<Checkbox
			label="Select all"
			checked={all}
			indeterminate={some}
			onchange={(v) => (items = items.map(() => v))}
		/>
		{#each items as on, i (i)}
			<div style="padding-left: 24px">
				<Checkbox label="Item {i + 1}" checked={on} onchange={(v) => (items[i] = v)} />
			</div>
		{/each}
	</div>
</div>
