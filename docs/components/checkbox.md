---
title: Checkbox
description: Boolean or indeterminate check with a label, in three sizes, controlled by the parent.
category: inputs
---

`Checkbox` is controlled: it shows `checked` and calls `onchange` with the next state. The parent stores the value.

```svelte
<script>
  import Checkbox from 'gpuix-fractalsvelte-ui/Checkbox.svelte';
  let agree = $state(false);
  let all = $state(false);
</script>

<Checkbox label="Accept terms" checked={agree} onchange={(v) => (agree = v)} />
<Checkbox label="Select all" indeterminate={!all && someSelected} onchange={(v) => (all = v)} />
<Checkbox label="Locked" checked disabled />
```

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `checked` | `boolean` | `false` |   |
| `indeterminate` | `boolean` | `false` | Shows a dash in place of the tick. The parent decides what a click means, and clears it. |
| `onchange` | `(checked: boolean) => void` | — | Called with the next checked state when the box or label is clicked, or Space is pressed. |
| `label` | `string` | `''` | Plain-text label, ignored when `children` is given. |
| `children` | `Snippet` | — |   |
| `disabled` | `boolean` | `false` |   |
| `size` | `'h-sm' \| 'h-md' \| 'h-bs'` | `'h-sm'` | Fractalstyler's height steps; the box is that height square. |
| `style` | `string \| null` | — |   |
| `testid` | `string \| null` | — |   |
## Tokens

`bg-surface`, `border-strong`, `radius-sm`, `ring`, `text-md`, `text-primary`, `text-theme`, `theme-color`
## Keyboard

| Key | Action |
| --- | --- |
| Space | Toggle while focused |

Enter is not handled.

## Examples

Every variant, size and state, exactly as the gallery's Demo view renders them.

```svelte
<script lang="ts">
	import Checkbox from 'gpuix-fractalsvelte-ui/Checkbox.svelte';

	let items = $state([true, false, true]);
	const all = $derived(items.every(Boolean));
	const some = $derived(items.some(Boolean) && !all);
	let terms = $state(false);
</script>

<div style="display: flex; flex-direction: row; gap: 48px">
	<div style="display: flex; flex-direction: column; gap: 12px">
		<Checkbox label="Small" size="h-sm" checked />
		<Checkbox label="Medium" size="h-md" checked={terms} onchange={(v) => (terms = v)} />
		<Checkbox label="Large" size="h-bs" checked />
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
```

## GPUI notes

- The root has `hitbox="self"`, so clicks on the box or label reach the row.
- The tick and dash are inline SVGs. They take their colour from `currentColor` via the `.mark` class.
- Focus is a border colour change on the box, since GPUI has no outline.
- A disabled row has `tabindex` -1 and no click handler effect; the `onchange` is never called.
