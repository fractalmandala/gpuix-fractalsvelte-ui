---
title: Popover
description: Floating panel anchored to a trigger, or to window coordinates, that closes on outside press or Escape.
category: overlays
---

`Popover` shows `content` beside its trigger while `open` is true. The parent owns `open`; the popover only asks to close through `onclose`. The trigger's own click handler toggles `open`, because presses on the trigger are not treated as outside presses.

```svelte
<script>
  import Popover from 'gpuix-fractalsvelte-ui/Popover.svelte';
  import Button from 'gpuix-fractalsvelte-ui/Button.svelte';
  let open = $state(false);
</script>

<Popover {open} onclose={() => (open = false)} side="bottom" align="start">
  <Button label="Menu" variant="outline" tone="neutral" onclick={() => (open = !open)} />
  {#snippet content()}
    <div>Rename</div>
    <div>Duplicate</div>
  {/snippet}
</Popover>
```

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `open` | `boolean` | — | Required. Shows the panel while true. |
| `onclose` | `() => void` | — | Required. Called on a press outside the panel and trigger, or on Escape. |
| `children` | `Snippet` | — | Required. The trigger. Toggle `open` from its own handler. |
| `content` | `Snippet` | — | Required. The panel body. |
| `side` | `'top' \| 'right' \| 'bottom' \| 'left'` | `'bottom'` | Which edge of the trigger the panel hangs from. |
| `align` | `'start' \| 'center' \| 'end'` | `'start'` | Alignment along that edge. |
| `gap` | `number` | `4` | Space between trigger and panel, in px. |
| `position` | `{ x: number; y: number } \| null` | `null` | Window coordinates to hang from instead of the trigger, for context-style menus. |
| `style` | `string \| null` | `null` | Inline CSS appended to the panel; wins over its rules. |
| `testid` | `string \| null` | `null` | Test id on the trigger anchor. |

## Tokens

`overlay`, `ink`, `border`, `radius-md`, `text-md`.

## Keyboard

| Key | Action |
| --- | --- |
| Escape | Calls `onclose` while open (listened window-wide only while open) |

## GPUI notes

- The panel is a fixed 1px border, 4px padding and 160px minimum width. Override width or padding through `style`.
- Outside-press detection uses the trigger's painted bounds, so a press on the trigger reaches its own click handler rather than closing the panel first.
- Use `position` for a menu opened at the pointer, with no trigger element to anchor to.
