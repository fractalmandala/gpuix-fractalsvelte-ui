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
<Spinner size="h-sm" />
<Spinner size="h-lg" variant="success" testid="saving" />
```

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `size` | `'h-sm' \| 'h-md' \| 'h-bs' \| 'h-lg'` | `'h-bs'` | Fractalstyler's height steps; the ring fits that size. |
| `variant` | `'themed' \| 'secondary' \| 'info' \| 'success' \| 'warning' \| 'danger'` | `'themed'` | Dot colour, in fractalstyler's names. |
| `style` | `string \| null` | — |   |
| `testid` | `string \| null` | — |   |
## Tokens

`danger`, `height-bs`, `height-lg`, `height-md`, `height-sm`, `info`, `radius-full`, `success`, `text-secondary`, `theme-color`, `warning`
## Keyboard

None.

## Examples

Every variant, size and state, exactly as the gallery's Demo view renders them.

```svelte
<script lang="ts">
	import Spinner from 'gpuix-fractalsvelte-ui/Spinner.svelte';
	const VARIANTS = ['themed', 'secondary', 'success', 'warning', 'danger'] as const;
</script>

<div style="display: flex; flex-direction: column; gap: 16px">
	<div style="display: flex; flex-direction: row; gap: 20px; align-items: center">
		<Spinner size="h-sm" />
		<Spinner size="h-md" />
		<Spinner size="h-lg" />
	</div>
	<div style="display: flex; flex-direction: row; gap: 20px; align-items: center">
		{#each VARIANTS as variant}
			<Spinner {variant} size="h-lg" />
		{/each}
	</div>
</div>
```

## GPUI notes

- GPUI has no looping motion, so the animation is a 90 ms timer that moves the lead dot. Each dot is absolutely positioned with a stepped opacity.
- The timer runs while the spinner is mounted. Unmount it when the work is done.
