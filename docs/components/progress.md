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
<Progress {value} variant="success" size="h-md" />
<Progress indeterminate />
```

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `value` | `number` | `0` | 0 to 100; out-of-range values are clamped. |
| `indeterminate` | `boolean` | `false` | Ignores `value` and sweeps a segment back and forth. |
| `variant` | `'themed' \| 'secondary' \| 'info' \| 'success' \| 'warning' \| 'danger'` | `'themed'` | Fractalstyler's colour names. |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Bar thickness: 4, 6 or 8 px. |
| `style` | `string \| null` | — |   |
| `testid` | `string \| null` | — |   |
## Tokens

`bg-raised`, `danger`, `info`, `radius-full`, `success`, `text-secondary`, `theme-color`, `warning`
## Examples

Every variant, size and state, exactly as the gallery's Demo view renders them.

```svelte
<script lang="ts">
	import Progress from 'gpuix-fractalsvelte-ui/Progress.svelte';
	import Button from 'gpuix-fractalsvelte-ui/Button.svelte';
	let value = $state(35);
</script>

<div style="display: flex; flex-direction: column; gap: 14px; width: 420px">
	<div style="display: flex; flex-direction: row; gap: 8px; align-items: center">
		<Button label="-10" size="h-md" variant="outline" onclick={() => (value = Math.max(0, value - 10))} />
		<Button label="+10" size="h-md" variant="outline" onclick={() => (value = Math.min(100, value + 10))} />
		<div style="color: var(--text-secondary)">{value}%</div>
	</div>
	<Progress {value} size="sm" />
	<Progress {value} />
	<Progress {value} size="lg" variant="success" />
	<Progress {value} variant="warning" />
	<Progress {value} variant="danger" />
	<Progress indeterminate />
</div>
```

## GPUI notes

- The determinate fill is `width` as a percentage, which GPUI allows on `width`.
- Indeterminate mode runs a 30 ms interval that re-renders the component while `indeterminate` is true. The timer is cleared when it turns off or the component unmounts.
- The track has `overflow: hidden`, so the fill is clipped to its rounded ends.
