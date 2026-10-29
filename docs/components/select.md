---
title: Select
description: Dropdown that picks one option from a list, with keyboard navigation and a scrolling list for long option sets.
category: inputs
---

`Select` shows the chosen option in a trigger and opens a list beside it. The list is a `Popover`, so it closes on an outside press and on Escape.

```svelte
<script>
  import Select from 'gpuix-fractalsvelte-ui/Select.svelte';
  let fruit = $state(null);
</script>

<Select
  options={[
    { value: 'apple', label: 'Apple' },
    { value: 'banana', label: 'Banana' },
    { value: 'date', label: 'Date', disabled: true }
  ]}
  value={fruit}
  onchange={(v) => (fruit = v)}
  placeholder="Pick a fruit"
/>
```

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `options` | `Option[]` | — |   |
| `value` | `string \| null` | — | The chosen option's value, or `null` to show the placeholder. |
| `onchange` | `(value: string) => void` | — |   |
| `placeholder` | `string` | `'Select…'` |   |
| `size` | `'h-md' \| 'h-bs' \| 'h-lg' \| 'h-xl'` | `'h-lg'` | Fractalstyler's height steps for the trigger and rows. |
| `disabled` | `boolean` | `false` |   |
| `style` | `string \| null` | — | Inline CSS for the trigger; `width` defaults to 200px. |
| `testid` | `string \| null` | — |   |
## Tokens

`bg-raised`, `bg-surface`, `border-strong`, `radius-md`, `radius-sm`, `ring`, `text-muted`, `text-primary`, `text-secondary`, `theme-color`
## Keyboard

| Key | Closed | Open |
| --- | --- | --- |
| Enter, Space, Down, Up | Open the list | Enter and Space pick the highlighted option |
| Down | — | Highlight the next enabled option |
| Up | — | Highlight the previous enabled option |
| Escape | — | Close without changing the value |
| Tab | — | Close |

Focus stays on the trigger while the list is open. The arrow keys move a highlight, not focus.

## Examples

Every variant, size and state, exactly as the gallery's Demo view renders them.

```svelte
<script lang="ts">
	import Select from 'gpuix-fractalsvelte-ui/Select.svelte';

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
```

## GPUI notes

- The panel's colours come from the fractalstyler tokens in `style`, since `Popover`'s own fallbacks are dark and would show in the light theme.
- Opening the list highlights the chosen option, or the first enabled one.
- The highlighted row is scrolled into view with `get_native().scrollIntoView`, which the headless renderer does not implement, so that scroll is only verified in a window.
