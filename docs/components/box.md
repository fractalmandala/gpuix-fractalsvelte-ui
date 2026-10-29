---
title: Box
description: Plain flex column with optional padding, background, border and corner radius.
category: layout
---

`Box` is the simplest container: a column with a background, border and radius you choose from a small set of options.

```svelte
<script>
  import Box from 'gpuix-fractalsvelte-ui/Box.svelte';
</script>

<Box bg="surface" padding="md" border radius="lg">
  Panel content
</Box>
<Box bg="raised" radius="sm" padding={6} />
```

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `children` | `Snippet` | — | Content. |
| `padding` | `'sm' \| 'md' \| 'lg' \| number` | `0` | Scale is 4 / 8 / 16 px; a number is px. Applied on all four sides. |
| `bg` | `'surface' \| 'raised' \| 'none'` | `'none'` | Background token, or transparent. |
| `border` | `boolean` | `false` | 1px border in the border colour. |
| `radius` | `'none' \| 'sm' \| 'md' \| 'lg'` | `'md'` | Corner radius. `none` is 0. |
| `style` | `string \| null` | `null` | Inline CSS, appended after `padding`, so it wins over it. |
| `testid` | `string \| null` | `null` | Test id on the root. |

## Tokens

`surface`, `raised`, `border`, `radius-sm`, `radius-md`, `radius-lg`.

## GPUI notes

- `style` is appended after the computed padding, so `style="padding: 0"` overrides the `padding` prop.
- Padding is written as an inline `padding` in px, not as a class.
