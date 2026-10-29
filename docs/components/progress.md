---
title: Progress
description: Horizontal progress bar for a known percentage, or an indeterminate sweep.
category: feedback
---

`Progress` shows how far a task has got, or that it is busy when the length is unknown.

```svelte
<script>
  import Progress from 'gpuix-fractalsvelte-ui/Progress.svelte';
  let value = $state(40);
</script>

<Progress {value} />
<Progress {value} tone="success" size="sm" />
<Progress indeterminate tone="neutral" />
```

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `value` | `number` | `0` | 0 to 100. Out-of-range values are clamped. |
| `indeterminate` | `boolean` | `false` | Ignores `value` and sweeps a segment back and forth. |
| `tone` | `'accent' \| 'neutral' \| 'success' \| 'warn' \| 'danger'` | `'accent'` | Fill colour. `neutral` uses the muted ink colour. |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Track heights 4 / 6 / 8 px. |
| `style` | `string \| null` | `null` | Inline CSS on the track. |
| `testid` | `string \| null` | `null` | Test id on the track; the fill gets `${testid}-fill`. |

## Tokens

`raised`, `radius-full`, `ink-muted`, `accent`, `success`, `warn`, `danger`.

## GPUI notes

- The determinate fill is `width` as a percentage, which GPUI allows on `width`.
- Indeterminate mode runs a 30 ms interval that re-renders the component while `indeterminate` is true. The timer is cleared when it turns off or the component unmounts.
- The track has `overflow: hidden`, so the fill is clipped to its rounded ends.
