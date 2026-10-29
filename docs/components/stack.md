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
| `children` | `Snippet` | — |   |
| `direction` | `'row' \| 'column'` | `'column'` |   |
| `gap` | `'xs' \| 'sm' \| 'md' \| 'bs' \| 'lg' \| 'xl' \| number` | `'sm'` | Fractalstyler's gap steps, or px. |
| `align` | `'start' \| 'center' \| 'end' \| 'stretch'` | `'stretch'` |   |
| `justify` | `'start' \| 'center' \| 'end' \| 'between' \| 'around'` | `'start'` |   |
| `wrap` | `boolean` | `false` |   |
| `padding` | `'sm' \| 'md' \| 'lg' \| number` | — | Fractalstyler's padding steps, or px, on all four sides. |
| `style` | `string \| null` | — |   |
| `testid` | `string \| null` | — |   |
## Tokens

None; the component takes its colours from the element it sits in.
## Keyboard

None.

## Examples

Every variant, size and state, exactly as the gallery's Demo view renders them.

```svelte
<script lang="ts">
	import Stack from 'gpuix-fractalsvelte-ui/Stack.svelte';
	import Box from 'gpuix-fractalsvelte-ui/Box.svelte';
	import Button from 'gpuix-fractalsvelte-ui/Button.svelte';
	const chip = 'font-size: var(--text-sm); color: var(--text-primary)';
	const caption = 'font-size: var(--text-sm); color: var(--text-secondary)';
	const tags = ['Design', 'Svelte', 'GPUI', 'Rust', 'Motion', 'Tokens', 'Docs'];
	let justify = $state<'start' | 'center' | 'between'>('between');
</script>

<div style="display: flex; flex-direction: column; gap: 18px">
	<div style="display: flex; flex-direction: column; gap: 8px">
		<div style={caption}>Row, gap md, align center</div>
		<Stack direction="row" gap="md" align="center">
			{#each tags.slice(0, 3) as t (t)}
				<Box bg="raised" radius="sm" padding={6}><div style={chip}>{t}</div></Box>
			{/each}
		</Stack>
	</div>
	<div style="display: flex; flex-direction: column; gap: 8px">
		<div style={caption}>Row, justify {justify} (click to cycle)</div>
		<Stack direction="row" justify={justify} align="center" gap="sm" style="padding: 10px; background-color: var(--bg-surface); border-width: 1px; border-color: var(--border); border-radius: var(--radius-md)">
			<div style="font-size: var(--text-md); font-weight: 600; color: var(--text-primary)">Toolbar</div>
			<Button label="Cycle" variant="outline" size="h-md" onclick={() => (justify = justify === 'between' ? 'center' : justify === 'center' ? 'start' : 'between')} />
		</Stack>
	</div>
	<div style="display: flex; flex-direction: row; gap: 24px; align-items: start">
		<div style="display: flex; flex-direction: column; gap: 8px; flex-grow: 1">
			<div style={caption}>Column, gap sm</div>
			<Stack direction="column" gap="sm">
				<Box bg="raised" radius="sm" padding="sm"><div style={chip}>Step one</div></Box>
				<Box bg="raised" radius="sm" padding="sm"><div style={chip}>Step two</div></Box>
				<Box bg="raised" radius="sm" padding="sm"><div style={chip}>Step three</div></Box>
			</Stack>
		</div>
		<div style="display: flex; flex-direction: column; gap: 8px; width: 200px">
			<div style={caption}>Wrap in 200px</div>
			<Stack direction="row" wrap gap="sm">
				{#each tags as t (t)}
					<Box bg="raised" radius="sm" padding={6}><div style={chip}>{t}</div></Box>
				{/each}
			</Stack>
		</div>
	</div>
</div>
```

## GPUI notes

- Gap and padding are written as inline px, so `style` can override them by appearing later in the same declaration list.
- `align` and `justify` map to class names (`al-*`, `jc-*`) rather than inline styles.
