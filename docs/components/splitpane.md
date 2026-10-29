---
title: SplitPane
description: Two panes divided by a draggable, keyboard-nudgeable grip, side by side or stacked.
category: layout
---

`SplitPane` puts `first` and `second` either side by side (`row`) or stacked (`column`), with a grip between them. Drag the grip, or focus it and press the arrow keys, to resize the first pane.

```svelte
<script>
  import SplitPane from 'gpuix-fractalsvelte-ui/SplitPane.svelte';
  let width = $state(240);
</script>

<div style="height: 400px; display: flex; flex-direction: column">
  <SplitPane initial={240} minFirst={120} minSecond={120} onresize={(s) => (width = s)}>
    {#snippet first()}<div>Sidebar</div>{/snippet}
    {#snippet second()}<div>Editor</div>{/snippet}
  </SplitPane>
</div>

<SplitPane direction="column" initial={160}>
  {#snippet first()}<div>Top</div>{/snippet}
  {#snippet second()}<div>Bottom</div>{/snippet}
</SplitPane>
```

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `first` | `Snippet` | — | Required. The leading pane. |
| `second` | `Snippet` | — | Required. The trailing pane, which takes the rest. |
| `direction` | `'row' \| 'column'` | `'row'` | `row` places the panes side by side; `column` stacks them. |
| `initial` | `number` | `240` | First pane's size in px at mount. Later changes are ignored. |
| `minFirst` | `number` | `80` | Smallest size of the first pane, in px. |
| `minSecond` | `number` | `80` | Smallest size of the second pane, in px. |
| `onresize` | `(size: number) => void` | — | Called with the first pane's size in px during a drag or nudge. |
| `style` | `string \| null` | `null` | Inline CSS on the root. |
| `testid` | `string \| null` | `null` | Test id on the root. The grip gets `${testid}-divider`. |

## Tokens

`border`, `ring`.

## Keyboard

| Key | Action |
| --- | --- |
| Left / Right (`row`) | Move the divider 10 px while the grip is focused |
| Up / Down (`column`) | Move the divider 10 px while the grip is focused |

The grip is focusable (Tab), and its line turns the ring colour while focused or dragged.

## GPUI notes

- GPUI does not capture the pointer. While dragging, an overlay covers the whole split so moves keep arriving, and a move with no button held ends the drag (the release landed elsewhere).
- Sizes are clamped to the split's painted bounds, which GPUI reports after mount. Before that, only `minFirst` applies.
- `initial` is read once, at mount. To set the size from outside, keep it in state and track it through `onresize`.
