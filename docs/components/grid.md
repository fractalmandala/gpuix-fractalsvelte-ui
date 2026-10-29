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
| `children` | `Snippet` | — |   |
| `columns` | `1 \| 2 \| 3 \| 4 \| 5 \| 6` | `2` | Number of equal-width columns, 1 to 6 (fractalstyler's grid-N classes). |
| `gap` | `'xs' \| 'sm' \| 'md' \| 'bs' \| 'lg' \| 'xl' \| number` | `'md'` | Fractalstyler's gap steps, or px. |
| `style` | `string \| null` | — |   |
| `testid` | `string \| null` | — |   |
## Tokens

None; the component takes its colours from the element it sits in.
## Examples

Every variant, size and state, exactly as the gallery's Demo view renders them.

```svelte
<script lang="ts">
	import Grid from 'gpuix-fractalsvelte-ui/Grid.svelte';
	import Box from 'gpuix-fractalsvelte-ui/Box.svelte';
	const metrics = [
		{ label: 'Revenue', value: '$48.2k' },
		{ label: 'Users', value: '1,284' },
		{ label: 'Retention', value: '62%' },
		{ label: 'Latency', value: '84 ms' },
		{ label: 'Errors', value: '0.2%' },
		{ label: 'Uptime', value: '99.98%' }
	];
</script>

<div style="display: flex; flex-direction: column; gap: 20px">
	<Grid columns={3} gap="md">
		{#each metrics as m (m.label)}
			<Box bg="raised" padding="md" radius="md">
				<div style="font-size: var(--text-sm); color: var(--text-secondary)">{m.label}</div>
				<div style="font-size: var(--text-xl); font-weight: 600; color: var(--text-primary)">{m.value}</div>
			</Box>
		{/each}
	</Grid>
	<Grid columns={2} gap="sm">
		{#each ['Inbox', 'Drafts', 'Sent', 'Archive'] as name (name)}
			<Box bg="surface" padding="sm" border radius="sm">
				<div style="padding: 6px 8px; font-size: var(--text-md); color: var(--text-primary)">{name}</div>
			</Box>
		{/each}
	</Grid>
</div>
```

## GPUI notes

- `columns` is written as a bare number into `grid-template-columns`. GPUI reads that as a count of equal tracks; it is not a standard CSS track list.
