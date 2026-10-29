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
| `children` | `Snippet` | — |   |
| `padding` | `'sm' \| 'md' \| 'lg' \| number` | — | Fractalstyler's padding steps, or px. |
| `bg` | `'surface' \| 'raised' \| 'none'` | `'none'` |   |
| `border` | `boolean` | `false` |   |
| `radius` | `'none' \| 'sm' \| 'md' \| 'lg'` | `'md'` |   |
| `style` | `string \| null` | — |   |
| `testid` | `string \| null` | — |   |
## Tokens

None; the component takes its colours from the element it sits in.
## Examples

Every variant, size and state, exactly as the gallery's Demo view renders them.

```svelte
<script lang="ts">
	import Box from 'gpuix-fractalsvelte-ui/Box.svelte';
	const caption = 'font-size: var(--text-sm); color: var(--text-secondary)';
	const chip = 'padding: 4px 8px; border-radius: var(--radius-sm); background-color: var(--theme-color-sub); font-size: var(--text-sm); color: var(--theme-color)';
</script>

<div style="display: flex; flex-direction: column; gap: 20px">
	<div style="display: flex; flex-direction: column; gap: 8px">
		<div style={caption}>Background</div>
		<div style="display: flex; flex-direction: row; gap: 12px">
			<Box bg="none" padding="md" border style="flex-grow: 1"><div style={caption}>none</div></Box>
			<Box bg="surface" padding="md" border style="flex-grow: 1"><div style={caption}>surface</div></Box>
			<Box bg="raised" padding="md" style="flex-grow: 1"><div style={caption}>raised</div></Box>
		</div>
	</div>
	<div style="display: flex; flex-direction: column; gap: 8px">
		<div style={caption}>Radius</div>
		<div style="display: flex; flex-direction: row; gap: 12px">
			{#each ['none', 'sm', 'md', 'lg'] as const as radius}
				<Box bg="raised" padding="sm" {radius} border style="flex-grow: 1; height: 44px; align-items: center; justify-content: center">
					<div style={caption}>{radius}</div>
				</Box>
			{/each}
		</div>
	</div>
	<div style="display: flex; flex-direction: column; gap: 8px">
		<div style={caption}>Padding</div>
		<div style="display: flex; flex-direction: row; gap: 12px; align-items: start">
			<Box bg="surface" padding="sm" border><div style={chip}>sm</div></Box>
			<Box bg="surface" padding="md" border><div style={chip}>md</div></Box>
			<Box bg="surface" padding="lg" border><div style={chip}>lg</div></Box>
			<Box bg="surface" padding={20} border><div style={chip}>20px</div></Box>
		</div>
	</div>
</div>
```

## GPUI notes

- `style` is appended after the computed padding, so `style="padding: 0"` overrides the `padding` prop.
- Padding is written as an inline `padding` in px, not as a class.
