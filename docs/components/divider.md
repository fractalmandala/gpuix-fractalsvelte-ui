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
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` |   |
| `label` | `string` | `''` | Shown centred in a horizontal divider. |
| `style` | `string \| null` | — |   |
| `testid` | `string \| null` | — |   |
## Tokens

`border`, `text-muted`, `text-sm`
## Examples

Every variant, size and state, exactly as the gallery's Demo view renders them.

```svelte
<script lang="ts">
	import Divider from 'gpuix-fractalsvelte-ui/Divider.svelte';
	const body = 'font-size: var(--text-md); color: var(--text-primary)';
	const muted = 'font-size: var(--text-sm); color: var(--text-secondary)';
</script>

<div style="display: flex; flex-direction: column; gap: 12px; width: 360px">
	<div style={body}>Profile</div>
	<Divider />
	<div style={muted}>Name, email and avatar.</div>
	<Divider label="Advanced" />
	<div style="display: flex; flex-direction: row; gap: 12px; align-items: center; height: 32px">
		<div style={body}>Left</div>
		<Divider orientation="vertical" />
		<div style={body}>Centre</div>
		<Divider orientation="vertical" />
		<div style={body}>Right</div>
	</div>
	<Divider label="Danger zone" />
	<div style={muted}>Deleting a workspace cannot be undone.</div>
</div>
```

## GPUI notes

- The rule stretches across the parent's cross axis through `align-self: stretch`, so put it in a flex row or column.
- A labelled divider is three elements: two `flex-grow` lines around the label.
