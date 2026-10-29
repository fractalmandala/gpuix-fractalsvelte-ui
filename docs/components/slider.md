---
title: Slider
description: Pick a number in a range by dragging the thumb, clicking the track or using the arrow keys.
category: inputs
---

`Slider` maps a value between `min` and `max` onto a horizontal track. Dragging, clicking and the keyboard all report through `onchange`.

```svelte
<script>
  import Slider from 'gpuix-fractalsvelte-ui/Slider.svelte';
  let volume = $state(40);
</script>

<Slider value={volume} onchange={(v) => (volume = v)} />
<Slider value={level} min={0} max={10} step={2} size="sm" onchange={(v) => (level = v)} />
```

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `value` | `number` | — | The current value. |
| `onchange` | `(value: number) => void` | — | Called with the new value, only when it changes. |
| `min` | `number` | `0` | The value at the track's start. |
| `max` | `number` | `100` | The value at the track's end. |
| `step` | `number` | `1` | Values snap to `min + n * step`. |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Thumb 12 / 16 / 20 px. Root height 18 / 22 / 26 px. |
| `disabled` | `boolean` | `false` | Dims the slider and ignores input. |
| `style` | `string` | — | Inline CSS on the root; wins over the component's rules. The default width is 240 px. |
| `testid` | `string` | — | Test id on the root; the track gets `<testid>-track` and the thumb `<testid>-thumb`. |

## Tokens

`accent`, `accent-soft`, `raised`, `surface`, `ring`, `radius-full`.

## Keyboard

| Key | Action |
| --- | --- |
| Right, Up | Step up by `step` |
| Left, Down | Step down by `step` |
| Home | Jump to `min` |
| End | Jump to `max` |

## GPUI notes

- A click or drag on the root sets the value from the track's painted bounds, so the root's hit area is taller than the track.
- The thumb is a child of the fill, so its position comes from the fill's width percentage and needs no measurement. Its overhang is a negative `right` offset.
- GPUI does not capture the pointer, so a drag shows a window-sized cover, which ends the drag on release or on a move with no button held.
