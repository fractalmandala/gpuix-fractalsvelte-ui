---
title: Tooltip
description: Short hover hint beside a trigger, shown after a delay and hidden when the pointer leaves.
category: overlays
---

`Tooltip` shows `content` next to its trigger after the pointer has rested on it for `delay` milliseconds. The trigger is a snippet that receives hover handlers, which it must spread onto its element so hover is tracked.

```svelte
<script>
  import Tooltip from 'gpuix-fractalsvelte-ui/Tooltip.svelte';
  import Button from 'gpuix-fractalsvelte-ui/Button.svelte';
</script>

<Tooltip content="Save (cmd-s)" side="bottom">
  {#snippet children(hover)}
    <div {...hover}>Save</div>
  {/snippet}
</Tooltip>

<Tooltip content="Delete" open={confirming}>
  {#snippet children(hover)}
    <div {...hover}><Button label="Delete" tone="danger" /></div>
  {/snippet}
</Tooltip>
```

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `children` | `Snippet<[{ onmouseenter, onmouseleave }]>` | — | Required. The trigger. Spread the received handlers onto it. |
| `content` | `string \| Snippet` | — | Required. Plain text or a snippet for the tip. |
| `side` | `'top' \| 'right' \| 'bottom' \| 'left'` | `'top'` | Which edge of the trigger the tip sits on. |
| `align` | `'start' \| 'center' \| 'end'` | `'center'` | Alignment along that edge. |
| `gap` | `number` | `6` | Space between trigger and tip, in px. |
| `delay` | `number` | `300` | Milliseconds of hover before the tip shows. |
| `open` | `boolean \| null` | `null` | Forces the tip shown or hidden. `null` leaves it to hover. |
| `style` | `string \| null` | `null` | Inline CSS appended to the tip box; wins over its rules. |
| `testid` | `string \| null` | `null` | Test id on the wrapper. |

## Tokens

`ink`, `bg`, `text-sm`, `radius-sm`.

The tip is inverted: the background is `ink` and the text is `bg`.

## Keyboard

None.

## GPUI notes

- A trigger with its own listener would cover the wrapper's hover, so the trigger must receive the handlers and spread them itself.
- Hover is tracked per source (wrapper, trigger, tip). Leaving the trigger hides the tip after an 80 ms grace period, which lets the pointer cross the gap onto the tip.
- The tip hangs from explicit corners rather than GPUI's `align: center`, which lands half a layer off.
- Clicks on the trigger still reach its own handlers, since the tip is only hover-driven.
