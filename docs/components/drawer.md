---
title: Drawer
description: Panel that slides in from the left, right or bottom over a scrim, with title, body and footer.
category: overlays
---

`Drawer` renders through `Portal` and slides its panel in from an edge. The parent owns `open`; the drawer only asks to close through `onclose`.

```svelte
<script>
  import Drawer from 'gpuix-fractalsvelte-ui/Drawer.svelte';
  import Button from 'gpuix-fractalsvelte-ui/Button.svelte';
  let open = $state(false);
</script>

<Button label="Settings" onclick={() => (open = true)} />
<Drawer {open} side="right" size="sm" title="Settings" onclose={() => (open = false)}>
  Settings body.
  {#snippet footer()}
    <Button label="Apply" onclick={apply} />
  {/snippet}
</Drawer>
```

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `open` | `boolean` | `false` | Shown while true. |
| `onclose` | `() => void` | — | Scrim click, Escape or the ✕ button. |
| `side` | `'left' \| 'right' \| 'bottom'` | `'right'` | Edge the panel slides in from. |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Width for `left` and `right` (320 / 420 / 560 px); height for `bottom` (240 / 320 / 440 px). |
| `title` | `string` | `''` | Header text. With no title there is no header and no ✕. |
| `dismissable` | `boolean` | `true` | `false` ignores scrim clicks and Escape, and hides the ✕. |
| `children` | `Snippet` | — | Body, inside a scrolling column with 20px padding. |
| `footer` | `Snippet` | — | Action row, right-aligned, with a top border. |
| `style` | `string \| null` | `null` | Inline CSS on the panel, appended after the size. |
| `testid` | `string \| null` | `null` | Test id on the panel; `-scrim` and `-close` suffixes for the parts. |

## Tokens

`scrim`, `overlay`, `ink`, `ink-muted`, `border`, `raised`, `surface`, `radius-sm`, `text-lg`.

## Keyboard

| Key | Action |
| --- | --- |
| Escape | Close, while open and `dismissable` |

## GPUI notes

- The Escape listener is registered only while the drawer is open and dismissable.
- The scrim fades in and the panel slides in through `motion`. Durations are 0.2 s.
- The panel has an empty `onclick`, so clicks inside it don't reach the scrim.
- `style` is appended after the size's width or height, so it can override them.
