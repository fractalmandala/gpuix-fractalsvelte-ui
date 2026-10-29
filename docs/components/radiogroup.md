---
title: RadioGroup
description: Pick one of a few options, in a column or a row, with arrow-key navigation.
category: inputs
---

`RadioGroup` shows a set of options and reports the one the user picks. Each option is a focusable `div`, so arrow keys and Space work in any GPUI tree.

```svelte
<script>
  import RadioGroup from 'gpuix-fractalsvelte-ui/RadioGroup.svelte';
  let plan = $state('monthly');
</script>

<RadioGroup
  options={[
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' },
    { value: 'lifetime', label: 'Lifetime', disabled: true }
  ]}
  value={plan}
  onchange={(v) => (plan = v)}
/>
<RadioGroup options={views} value={view} direction="row" onchange={(v) => (view = v)} />
```

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `options` | `Option[]` | — |   |
| `value` | `string \| null` | — | The checked option's value, or `null` for none. |
| `onchange` | `(value: string) => void` | — |   |
| `direction` | `'row' \| 'column'` | `'column'` |   |
| `size` | `'h-sm' \| 'h-md' \| 'h-bs'` | `'h-sm'` | Fractalstyler's height steps; each circle is that height square. |
| `disabled` | `boolean` | `false` |   |
| `style` | `string \| null` | — |   |
| `testid` | `string \| null` | — |   |
## Tokens

`bg-surface`, `border-strong`, `radius-full`, `ring`, `text-md`, `text-primary`, `theme-color`
## Keyboard

| Key | Action |
| --- | --- |
| Down, Right | Select the next enabled option, wrapping at the end |
| Up, Left | Select the previous enabled option, wrapping at the start |
| Space | Select the focused option |

## Examples

Every variant, size and state, exactly as the gallery's Demo view renders them.

```svelte
<script lang="ts">
	import RadioGroup from 'gpuix-fractalsvelte-ui/RadioGroup.svelte';
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
```

## GPUI notes

- The focus ring is a border colour change on the circle, since GPUI has no outline or shadow.
- Arrow keys move focus with the selection through `get_native().focusElement`, which works in headless tests too. The `focus_element` window helper is a no-op headless.
- Every enabled option is a tab stop, so Tab visits each one. A roving tab stop (one per group) would match native radios more closely; it is not implemented.
