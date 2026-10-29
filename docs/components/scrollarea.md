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
| `children` | `Snippet` | — | Required. The scrolling content. |
| `height` | `number \| null` | `null` | Fixed height in px. |
| `maxHeight` | `number \| null` | `null` | Height cap in px. The area shrinks to its content below the cap. |
| `gap` | `number` | `8` | px between the content's direct children. |
| `style` | `string \| null` | `null` | Inline CSS on the root box. |
| `testid` | `string \| null` | `null` | Test id on the root. The scrolling column gets `${testid}-list`. |

## Tokens

None. The thumb colour is set with `set_css_vars`, not from the theme.

## Keyboard

None.

## GPUI notes

- GPUI paints no scrollbars, so the scroll thumb is drawn by the underlying `Scroller` and dragged on an overlay.
- The thumb colours are translucent neutral greys set with `set_css_vars`. Those variables are global, so they apply to every scroll column in the window, not just this one.
- `height` and `maxHeight` are written as inline px. Pass both and `height` is applied first, so `maxHeight` only caps it.
