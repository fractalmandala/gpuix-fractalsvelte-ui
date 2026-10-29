---
title: ScrollArea
description: Vertically scrolling column with a fixed height or a height cap, and a drawn scroll thumb.
category: layout
---

`ScrollArea` wraps its children in a scrolling column. Set `height` for a fixed box or `maxHeight` to shrink to the content up to a cap.

```svelte
<script>
  import ScrollArea from 'gpuix-fractalsvelte-ui/ScrollArea.svelte';
</script>

<ScrollArea maxHeight={160} gap={4}>
  {#each rows as row}
    <div>{row}</div>
  {/each}
</ScrollArea>

<ScrollArea height={320}>
  <div>Pinned panel content</div>
</ScrollArea>
```

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `children` | `Snippet` | — |   |
| `height` | `number \| null` | — | Fixed height in px. |
| `maxHeight` | `number \| null` | — | Height cap in px; the area shrinks to its content below the cap. |
| `gap` | `number` | `8` | px between the content's direct children. |
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
	import ScrollArea from 'gpuix-fractalsvelte-ui/ScrollArea.svelte';
	const rows = Array.from({ length: 20 }, (_, i) => i + 1);
	const caption = 'font-size: var(--text-sm); color: var(--text-secondary); padding-bottom: 6px';
	const frame = 'width: 200px; padding: 8px; background-color: var(--bg-surface); border-width: 1px; border-color: var(--border); border-radius: var(--radius-md)';
	const line = 'font-size: var(--text-md); color: var(--text-primary)';
</script>

<div style="display: flex; flex-direction: row; gap: 16px; align-items: start">
	<div>
		<div style={caption}>maxHeight 150</div>
		<ScrollArea maxHeight={150} gap={4} style={frame}>
			{#each rows as r (r)}<div style="height: 22px; {line}">Message {r}</div>{/each}
		</ScrollArea>
	</div>
	<div>
		<div style={caption}>fixed height 150</div>
		<ScrollArea height={150} gap={4} style={frame}>
			{#each rows as r (r)}<div style="height: 22px; {line}">Track {r}</div>{/each}
		</ScrollArea>
	</div>
	<div>
		<div style={caption}>short, shrinks to content</div>
		<ScrollArea maxHeight={150} gap={4} style={frame}>
			<div style="height: 22px; {line}">Only item</div>
			<div style="height: 22px; {line}">Second item</div>
		</ScrollArea>
	</div>
</div>
```

## GPUI notes

- GPUI paints no scrollbars, so the scroll thumb is drawn by the underlying `Scroller` and dragged on an overlay.
- The thumb colours are translucent neutral greys set with `set_css_vars`. Those variables are global, so they apply to every scroll column in the window, not just this one.
- `height` and `maxHeight` are written as inline px. Pass both and `height` is applied first, so `maxHeight` only caps it.
