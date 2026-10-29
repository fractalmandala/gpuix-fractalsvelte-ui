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
<Slider value={level} min={0} max={10} step={2} size="h-sm" onchange={(v) => (level = v)} />
```

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `value` | `number` | — |   |
| `onchange` | `(value: number) => void` | — |   |
| `min` | `number` | `0` |   |
| `max` | `number` | `100` |   |
| `step` | `number` | `1` | Values snap to `min + n * step`. |
| `size` | `'h-sm' \| 'h-md' \| 'h-bs'` | `'h-md'` | Fractalstyler's height steps for the control. |
| `disabled` | `boolean` | `false` |   |
| `style` | `string \| null` | — |   |
| `testid` | `string \| null` | — |   |
## Tokens

`bg-raised`, `bg-surface`, `height-bs`, `height-md`, `height-sm`, `radius-full`, `ring`, `theme-color`, `theme-color-sub`
## Keyboard

| Key | Action |
| --- | --- |
| Right, Up | Step up by `step` |
| Left, Down | Step down by `step` |
| Home | Jump to `min` |
| End | Jump to `max` |

## Examples

Every variant, size and state, exactly as the gallery's Demo view renders them.

```svelte
<script lang="ts">
	import Slider from 'gpuix-fractalsvelte-ui/Slider.svelte';
	let volume = $state(40);
	let brightness = $state(70);
	let level = $state(4);
</script>

<div style="display: flex; flex-direction: column; gap: 20px; padding: 8px; width: 360px">
	<div style="display: flex; flex-direction: column; gap: 8px">
		<div style="display: flex; flex-direction: row; justify-content: space-between; color: var(--text-secondary); font-size: var(--text-sm)">
			<div>Volume</div><div>{volume}</div>
		</div>
		<Slider value={volume} onchange={(v) => (volume = v)} />
	</div>
	<div style="display: flex; flex-direction: column; gap: 8px">
		<div style="color: var(--text-secondary); font-size: var(--text-sm)">Step 2 of 0–10 · sm</div>
		<Slider value={level} min={0} max={10} step={2} size="h-sm" onchange={(v) => (level = v)} />
	</div>
	<div style="display: flex; flex-direction: column; gap: 8px">
		<div style="color: var(--text-secondary); font-size: var(--text-sm)">Large</div>
		<Slider value={brightness} size="h-bs" onchange={(v) => (brightness = v)} />
	</div>
	<div style="display: flex; flex-direction: column; gap: 8px">
		<div style="color: var(--text-secondary); font-size: var(--text-sm)">Disabled</div>
		<Slider value={30} disabled />
	</div>
</div>
```

## GPUI notes

- A click or drag on the root sets the value from the track's painted bounds, so the root's hit area is taller than the track.
- The thumb is a child of the fill, so its position comes from the fill's width percentage and needs no measurement. Its overhang is a negative `right` offset.
- GPUI does not capture the pointer, so a drag shows a window-sized cover, which ends the drag on release or on a move with no button held.
