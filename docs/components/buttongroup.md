---
title: ButtonGroup
description: Row of attached buttons, or a segmented single-select control driven by options and value.
category: actions
---

`ButtonGroup` has two modes. Give it `options` for a segmented, single-select control. Give it children to lay buttons out in a row.

```svelte
<script>
  import ButtonGroup from 'gpuix-fractalsvelte-ui/ButtonGroup.svelte';
  let range = $state('week');
</script>

<ButtonGroup
  options={[
    { value: 'day', label: 'Day' },
    { value: 'week', label: 'Week' },
    { value: 'year', label: 'Year', disabled: true }
  ]}
  value={range}
  onchange={(v) => (range = v)}
/>

<ButtonGroup>
  <Button variant="outline" label="Left" />
  <Button variant="outline" label="Right" />
</ButtonGroup>
```

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `children` | `Snippet` | — | Attached mode: the child buttons laid out edge to edge. |
| `options` | `Option[]` | — | Segmented mode: one selectable segment per option. Use instead of `children`. |
| `value` | `T \| null` | — |   |
| `onchange` | `(value: T) => void` | — |   |
| `variant` | `'primary' \| 'secondary' \| 'themed' \| 'outline' \| 'ghost' \| 'link' \| 'info' \| 'success' \| 'warning' \| 'danger'` | `'primary'` | Fractalstyler's variant for the selected segment. |
| `size` | `'h-sm' \| 'h-md' \| 'h-bs' \| 'h-lg' \| 'h-xl'` | `'h-bs'` | Fractalstyler's size axis. |
| `style` | `string \| null` | — |   |
| `testid` | `string \| null` | — |   |
## Tokens

`bg-raised`, `border`, `radius-md`, `radius-sm`, `ring`, `text-secondary`
## Keyboard

| Key | Action |
| --- | --- |
| Tab | Moves focus to the segmented group (one stop) |
| Left, Up | Select the previous enabled option, wrapping |
| Right, Down | Select the next enabled option, wrapping |

## Examples

Every variant, size and state, exactly as the gallery's Demo view renders them.

```svelte
<script lang="ts">
	import Button from 'gpuix-fractalsvelte-ui/Button.svelte';
	import ButtonGroup from 'gpuix-fractalsvelte-ui/ButtonGroup.svelte';
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
```

## GPUI notes

- Segmented mode is one focusable track, not one tab stop per segment, as in a native radio group.
- In attached mode, `Button`, `IconButton` and `Toggle` children join automatically. Through context they learn whether they are first, middle or last, square their inner corners, and overlap borders by 1px so seams never double. Other children are laid out edge to edge unchanged.
