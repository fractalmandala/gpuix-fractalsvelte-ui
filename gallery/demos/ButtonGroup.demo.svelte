<script lang="ts">
	import Button from '../../src/components/Button.svelte';
	import ButtonGroup from '../../src/components/ButtonGroup.svelte';
	type Range = 'day' | 'week' | 'month' | 'year';
	let range = $state<Range>('week');
	let view = $state('list');
	let align = $state('left');
	const views = [
		{ value: 'list', label: 'List' },
		{ value: 'board', label: 'Board' },
		{ value: 'graph', label: 'Graph' }
	];
	const aligns = [
		{ value: 'left', label: 'Left' },
		{ value: 'centre', label: 'Centre' },
		{ value: 'right', label: 'Right' }
	];
</script>

<div style="display: flex; flex-direction: column; gap: 16px">
	<div style="display: flex; flex-direction: row; gap: 12px; align-items: center">
		<ButtonGroup
			options={[
				{ value: 'day', label: 'Day' },
				{ value: 'week', label: 'Week' },
				{ value: 'month', label: 'Month' },
				{ value: 'year', label: 'Year', disabled: true }
			]}
			value={range}
			onchange={(v: Range) => (range = v)}
		/>
		<div style="color: var(--text-secondary)">range: {range}</div>
	</div>
	<div style="display: flex; flex-direction: row; gap: 12px; align-items: center">
		<ButtonGroup options={views} value={view} onchange={(v) => (view = v)} variant="secondary" size="h-md" />
		<ButtonGroup options={views} value={view} onchange={(v) => (view = v)} variant="success" size="h-lg" />
	</div>
	<div style="display: flex; flex-direction: row; gap: 12px; align-items: center">
		<ButtonGroup options={aligns} value={align} onchange={(v) => (align = v)} variant="warning" />
		<ButtonGroup options={aligns} value={align} onchange={(v) => (align = v)} variant="danger" />
	</div>
	<div style="display: flex; flex-direction: row; gap: 0">
		<ButtonGroup>
			{#snippet children()}
				<Button variant="outline" size="h-md" label="Undo" />
				<Button variant="outline" size="h-md" label="Redo" />
				<Button variant="outline" size="h-md" label="Reset" />
			{/snippet}
		</ButtonGroup>
	</div>
</div>
