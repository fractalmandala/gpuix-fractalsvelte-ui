---
title: Divider
description: Hairline rule, horizontal or vertical, with an optional centred label.
category: layout
---

`Divider` draws a 1px rule. A horizontal divider can carry a centred label; a vertical one cannot.

```svelte
<script>
  import Divider from 'gpuix-fractalsvelte-ui/Divider.svelte';
</script>

<Divider />
<Divider label="Advanced" />
<Divider orientation="vertical" />
```

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | Vertical is 1px wide and stretches to the row height. |
| `label` | `string` | `''` | Centred in a horizontal divider. Ignored when vertical. |
| `style` | `string \| null` | `null` | Inline CSS on the root. |
| `testid` | `string \| null` | `null` | Test id on the root. |

## Tokens

`border`, `ink-faint`, `text-sm`.

## GPUI notes

- The rule stretches across the parent's cross axis through `align-self: stretch`, so put it in a flex row or column.
- A labelled divider is three elements: two `flex-grow` lines around the label.
