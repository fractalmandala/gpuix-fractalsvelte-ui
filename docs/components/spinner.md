---
title: Spinner
description: Indeterminate loading indicator drawn as a ring of fading dots.
category: feedback
---

`Spinner` shows ongoing work with no progress value. It draws eight dots in a ring and steps the bright lead dot around it on a timer.

```svelte
<script>
  import Spinner from 'gpuix-fractalsvelte-ui/Spinner.svelte';
</script>

<Spinner />
<Spinner size="sm" tone="neutral" />
<Spinner size="lg" tone="success" testid="saving" />
```

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Boxes of 16 / 24 / 32 px. |
| `tone` | `'accent' \| 'neutral' \| 'success' \| 'warn' \| 'danger'` | `'accent'` | Dot colour. `neutral` uses the muted ink. |
| `style` | `string \| null` | `null` | Inline CSS on the root box. |
| `testid` | `string \| null` | `null` | Test id on the root. |

## Tokens

`accent`, `ink-muted`, `success`, `warn`, `danger`, `radius-full`.

## Keyboard

None.

## GPUI notes

- GPUI has no looping motion, so the animation is a 90 ms timer that moves the lead dot. Each dot is absolutely positioned with a stepped opacity.
- The timer runs while the spinner is mounted. Unmount it when the work is done.
