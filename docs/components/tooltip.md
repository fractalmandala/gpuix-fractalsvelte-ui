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
    <div {...hover}><Button label="Delete" variant="danger" /></div>
  {/snippet}
</Tooltip>
```

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `children` | `Snippet<[{ onmouseenter: () => void; onmouseleave: () => void }]>` | — | The trigger; spread the handlers it receives onto it so hover still works. |
| `content` | `string \| Snippet` | — |   |
| `side` | `'top' \| 'right' \| 'bottom' \| 'left'` | `'top'` |   |
| `align` | `'start' \| 'center' \| 'end'` | `'center'` |   |
| `gap` | `number` | `6` |   |
| `delay` | `number` | `300` | ms of hover before the tip shows. |
| `open` | `boolean \| null` | — | Forces the tip shown or hidden; `null` leaves it to hover. |
| `style` | `string \| null` | — |   |
| `testid` | `string \| null` | — |   |
## Tokens

None; the component takes its colours from the element it sits in.
## Keyboard

None.

## Examples

Every variant, size and state, exactly as the gallery's Demo view renders them.

```svelte
<script lang="ts">
	import Tooltip from 'gpuix-fractalsvelte-ui/Tooltip.svelte';
	const trigger = 'padding: 6px 12px; border-radius: var(--radius-sm); background-color: var(--bg-raised); color: var(--text-primary); font-size: var(--text-md)';
	const hover = 'background-color: var(--border)';
	const caption = 'font-size: var(--text-sm); color: var(--text-secondary)';
</script>

<div style="display: flex; flex-direction: column; gap: 24px; padding-top: 44px">
	<div style="display: flex; flex-direction: row; gap: 16px; align-items: center; justify-content: center">
		{#each ['top', 'right', 'bottom', 'left'] as const as side}
			<Tooltip content={`Shown on the ${side}`} {side} delay={150}>
				{#snippet children(h)}
					<div {...h} style={trigger} {hover}>{side}</div>
				{/snippet}
			</Tooltip>
		{/each}
	</div>
	<div style="display: flex; flex-direction: row; gap: 16px; align-items: center">
		<Tooltip content="Save (⌘S)" delay={150}>
			{#snippet children(h)}
				<div {...h} style={trigger} {hover}>Save</div>
			{/snippet}
		</Tooltip>
		<Tooltip content="Forced open" open={true} side="bottom">
			{#snippet children(h)}
				<div {...h} style={trigger} {hover}>Pinned</div>
			{/snippet}
		</Tooltip>
		<div style={caption}>Hover the buttons. "Pinned" is forced open.</div>
	</div>
</div>
```

## GPUI notes

- A trigger with its own listener would cover the wrapper's hover, so the trigger must receive the handlers and spread them itself.
- Hover is tracked per source (wrapper, trigger, tip). Leaving the trigger hides the tip after an 80 ms grace period, which lets the pointer cross the gap onto the tip.
- The tip hangs from explicit corners rather than GPUI's `align: center`, which lands half a layer off.
- Clicks on the trigger still reach its own handlers, since the tip is only hover-driven.
