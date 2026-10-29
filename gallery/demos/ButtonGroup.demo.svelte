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
		<div style="color: var(--ui-ink-muted)">range: {range}</div>
	</div>
	<div style="display: flex; flex-direction: row; gap: 12px; align-items: center">
		<ButtonGroup options={views} value={view} onchange={(v) => (view = v)} tone="neutral" size="sm" />
		<ButtonGroup options={views} value={view} onchange={(v) => (view = v)} tone="success" size="lg" />
	</div>
	<div style="display: flex; flex-direction: row; gap: 12px; align-items: center">
		<ButtonGroup options={aligns} value={align} onchange={(v) => (align = v)} tone="warn" />
		<ButtonGroup options={aligns} value={align} onchange={(v) => (align = v)} tone="danger" />
	</div>
	<div style="display: flex; flex-direction: row; gap: 0">
		<ButtonGroup>
			{#snippet children()}
				<Button variant="outline" tone="neutral" size="sm" label="Undo" />
				<Button variant="outline" tone="neutral" size="sm" label="Redo" />
				<Button variant="outline" tone="neutral" size="sm" label="Reset" />
			{/snippet}
		</ButtonGroup>
	</div>
</div>
