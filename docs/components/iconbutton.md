---
title: IconButton
description: Square icon-only action with a hover tooltip, sharing Button's variants and sizes.
category: actions
---

`IconButton` is a square `Button` for a single icon. Give it a `label` and hovering shows a tooltip. Like `Button`, it is a focusable `div`.

```svelte
<script>
  import IconButton from 'gpuix-fractalsvelte-ui/IconButton.svelte';
</script>

<IconButton glyph="+" label="Add" onclick={add} />
<IconButton variant="danger" label="Delete">
  {#snippet children()}🗑{/snippet}
</IconButton>
<IconButton glyph="✕" size="h-md" disabled />
```

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `children` | `Snippet` | — | The icon; `glyph` is the plain-text shorthand. |
| `glyph` | `string` | `''` |   |
| `label` | `string` | `''` | Tooltip text shown after a short hover. |
| `variant` | `'primary' \| 'secondary' \| 'themed' \| 'outline' \| 'ghost' \| 'link' \| 'info' \| 'success' \| 'warning' \| 'danger'` | `'ghost'` | Fractalstyler's variant axis. |
| `size` | `'h-sm' \| 'h-md' \| 'h-bs' \| 'h-lg' \| 'h-xl'` | `'h-bs'` | Fractalstyler's size axis; the button is a square of that height. |
| `shape` | `'square' \| 'min' \| 'modern' \| 'curved' \| 'round'` | `'min'` |   |
| `disabled` | `boolean` | `false` |   |
| `onclick` | `(e: GpuixEvent) => void` | — |   |
| `style` | `string \| null` | — |   |
| `testid` | `string \| null` | — |   |
## Tokens

None; the component takes its colours from the element it sits in.
## Keyboard

| Key | Action |
| --- | --- |
| Enter, Space | Activate while focused |

## Examples

Every variant, size and state, exactly as the gallery's Demo view renders them.

```svelte
<script lang="ts">
	import IconButton from 'gpuix-fractalsvelte-ui/IconButton.svelte';
	let added = $state(0);
	const variants = ['primary', 'secondary', 'themed', 'outline', 'ghost', 'link', 'info', 'success', 'warning', 'danger'] as const;
	const sizes = ['h-sm', 'h-md', 'h-bs', 'h-lg', 'h-xl'] as const;
	const shapes = ['square', 'min', 'modern', 'curved', 'round'] as const;
</script>

<div style="display: flex; flex-direction: column; gap: 12px">
	<div style="display: flex; flex-direction: row; flex-wrap: wrap; gap: 8px">
		{#each variants as v}
			<IconButton variant={v} glyph="+" label={v} onclick={() => added++} />
		{/each}
	</div>
	<div style="display: flex; flex-direction: row; gap: 8px; align-items: center">
		{#each shapes as s}
			<IconButton shape={s} variant="outline" glyph="+" label={s} />
		{/each}
	</div>
	<div style="display: flex; flex-direction: row; gap: 8px; align-items: center">
		{#each sizes as z}
			<IconButton size={z} glyph="✕" label={z} />
		{/each}
	</div>
	<div style="display: flex; flex-direction: row; gap: 8px; align-items: center">
		<IconButton glyph="−" label="Disabled" disabled />
		<IconButton variant="themed" label="Star">
			{#snippet children()}★{/snippet}
		</IconButton>
	</div>
	<div>added: {added}</div>
</div>
```

## GPUI notes

- The tooltip wraps the button with `Tooltip` and spreads its hover handlers onto the button. A button with its own `onclick` would otherwise block the hover.
- The focus ring is a border colour change, since GPUI has no outline or shadow.
- Disabled buttons drop their hover rule rather than overriding it.
