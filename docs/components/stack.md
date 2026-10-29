---
title: Stack
description: Flex row or column with spacing, alignment, justification and optional wrapping.
category: layout
---

`Stack` lays out its children in a flex row or column with a shared gap and padding. Use it instead of hand-writing flex styles.

```svelte
<script>
  import Stack from 'gpuix-fractalsvelte-ui/Stack.svelte';
</script>

<Stack gap="sm" padding="md">
  <div>First</div>
  <div>Second</div>
</Stack>

<Stack direction="row" align="center" justify="between" gap={12}>
  <span>Label</span>
  <span>Value</span>
</Stack>

<Stack direction="row" wrap gap="md" style="width: 240px">
  <div>Tag</div>
  <div>Tag</div>
</Stack>
```

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `children` | `Snippet` | — | Required. The items to lay out. |
| `direction` | `'row' \| 'column'` | `'column'` | Main axis. |
| `gap` | `'sm' \| 'md' \| 'lg' \| number` | `'md'` | Scale of 4 / 8 / 16 px, or px. |
| `align` | `'start' \| 'center' \| 'end' \| 'stretch'` | `'stretch'` | Cross-axis alignment. |
| `justify` | `'start' \| 'center' \| 'end' \| 'between' \| 'around'` | `'start'` | Main-axis distribution. `between` and `around` map to space-between and space-around. |
| `wrap` | `boolean` | `false` | Lets items wrap onto new lines. |
| `padding` | `'sm' \| 'md' \| 'lg' \| number` | `0` | Same scale as `gap`, applied to all four sides. |
| `style` | `string \| null` | `null` | Inline CSS, appended after gap and padding so it wins. |
| `testid` | `string \| null` | `null` | Test id on the root. |

## Tokens

None.

## Keyboard

None.

## GPUI notes

- Gap and padding are written as inline px, so `style` can override them by appearing later in the same declaration list.
- `align` and `justify` map to class names (`al-*`, `jc-*`) rather than inline styles.
