---
title: Spacer
description: Flexible empty box that takes up the free space in a row or column.
category: layout
---

`Spacer` grows to fill the leftover space in its flex parent, pushing siblings apart.

```svelte
<script>
  import Spacer from 'gpuix-fractalsvelte-ui/Spacer.svelte';
  import Stack from 'gpuix-fractalsvelte-ui/Stack.svelte';
</script>

<Stack direction="row" align="center">
  <span>Title</span>
  <Spacer />
  <span>Actions</span>
</Stack>
```

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
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
	import Spacer from 'gpuix-fractalsvelte-ui/Spacer.svelte';
	import Box from 'gpuix-fractalsvelte-ui/Box.svelte';
	import Button from 'gpuix-fractalsvelte-ui/Button.svelte';
	const title = 'font-size: var(--text-md); font-weight: 600; color: var(--text-primary)';
	const muted = 'font-size: var(--text-sm); color: var(--text-secondary)';
</script>

<div style="display: flex; flex-direction: column; gap: 16px">
	<Box bg="surface" border radius="md" padding="sm" style="flex-direction: row; gap: 8px; align-items: center">
		<div style="padding: 0 6px; {title}">Atlas</div>
		<Spacer />
		<Button label="Share" variant="ghost" size="h-md" />
		<Button label="Publish" size="h-md" />
	</Box>
	<Box bg="surface" border radius="md" padding="md" style="height: 200px; gap: 8px">
		<div style={title}>Invoice #1042</div>
		<div style={muted}>Issued 3 June · Due 17 June</div>
		<Spacer />
		<div style={muted}>Total due</div>
		<div style="font-size: var(--text-2xl); font-weight: 600; color: var(--text-primary)">$2,480.00</div>
		<div style="display: flex; flex-direction: row; gap: 8px; align-items: center">
			<Spacer />
			<Button label="Pay now" size="h-md" />
		</div>
	</Box>
</div>
```

## GPUI notes

- Sizing is `flex-grow: 1` only. It works inside a flex row or column, and does nothing in a parent without flex.
- Set a size through `style` to keep a minimum gap, since the spacer itself has no minimum.
