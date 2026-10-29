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
| `checked` | `boolean` | `false` | Tick shown while true. |
| `indeterminate` | `boolean` | `false` | Shows a dash instead of the tick. The parent decides what a click means and clears it. |
| `onchange` | `(checked: boolean) => void` | — | Called with the next checked state on box or label click, or Space. |
| `label` | `string` | `''` | Plain-text label. Ignored when `children` is given. |
| `children` | `Snippet` | — | Rich label. |
| `disabled` | `boolean` | `false` | Dims to half opacity, ignores clicks and leaves the tab order. |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Box 14 / 16 / 20 px. |
| `style` | `string \| null` | `null` | Inline CSS on the root. |
| `testid` | `string \| null` | `null` | Test id on the root; the box gets `${testid}-box`. |

## Tokens

`surface`, `border-strong`, `accent`, `accent-ink`, `ring`, `ink`, `text-sm`, `text-md`, `text-lg`.

## Keyboard

| Key | Action |
| --- | --- |
| Space | Toggle while focused |

Enter is not handled.

## GPUI notes

- The root has `hitbox="self"`, so clicks on the box or label reach the row.
- The tick and dash are inline SVGs. They take their colour from `currentColor` via the `.mark` class.
- Focus is a border colour change on the box, since GPUI has no outline.
- A disabled row has `tabindex` -1 and no click handler effect; the `onchange` is never called.
