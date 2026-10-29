---
title: Grid
description: Equal-width column grid with a spacing gap between cells.
category: layout
---

`Grid` lays its children out in a fixed number of equal columns.

```svelte
<script>
  import Grid from 'gpuix-fractalsvelte-ui/Grid.svelte';
  import Box from 'gpuix-fractalsvelte-ui/Box.svelte';
</script>

<Grid columns={3} gap="sm">
  {#each items as item}
    <Box bg="raised" radius="sm" padding="md">{item}</Box>
  {/each}
</Grid>
```

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `children` | `Snippet` | — | Grid cells. |
| `columns` | `number` | `2` | Number of equal-width columns. |
| `gap` | `'sm' \| 'md' \| 'lg' \| number` | `'md'` | Scale is 4 / 8 / 16 px; a number is px. Applied between rows and columns. |
| `style` | `string \| null` | `null` | Inline CSS on the root, appended after the generated grid rules, so it can override them. |
| `testid` | `string \| null` | `null` | Test id on the root. |

## Tokens

None. The component draws no colours or radii.

## GPUI notes

- `columns` is written as a bare number into `grid-template-columns`. GPUI reads that as a count of equal tracks; it is not a standard CSS track list.
