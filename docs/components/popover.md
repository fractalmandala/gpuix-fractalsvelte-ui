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
  let picked = $state('none');
  const choose = (name: string) => { picked = name; open = false; };
</script>

<Popover {open} onclose={() => (open = false)} side="bottom" align="start">
  <Button label="Menu" variant="outline" onclick={() => (open = !open)} />
  {#snippet content()}
    <div onclick={() => choose('Rename')}>Rename</div>
    <div onclick={() => choose('Duplicate')}>Duplicate</div>
  {/snippet}
</Popover>

<div>picked: {picked}</div>
```

Pass `position={{ x, y }}` (window coordinates) instead of a trigger to hang the panel at a point, such as the pointer.

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `open` | `boolean` | — |   |
| `onclose` | `() => void` | — | A press outside the panel and its trigger, or Escape. |
| `children` | `Snippet` | — | The trigger; it toggles `open` itself. |
| `content` | `Snippet` | — |   |
| `side` | `'top' \| 'right' \| 'bottom' \| 'left'` | `'bottom'` |   |
| `align` | `'start' \| 'center' \| 'end'` | `'start'` |   |
| `gap` | `number` | `4` |   |
| `position` | `{ x: number; y: number } \| null` | — | Window coordinates to hang from instead of the trigger. |
| `style` | `string \| null` | — |   |
| `testid` | `string \| null` | — |   |
## Tokens

None; the component takes its colours from the element it sits in.
## Keyboard

| Key | Action |
| --- | --- |
| Escape | Calls `onclose` while open (listened window-wide only while open) |

## Examples

Every variant, size and state, exactly as the gallery's Demo view renders them.

```svelte
<script lang="ts">
	import Button from 'gpuix-fractalsvelte-ui/Button.svelte';
	import Popover from 'gpuix-fractalsvelte-ui/Popover.svelte';
	let which = $state<'actions' | 'share' | 'sort' | null>(null);
	let last = $state('none');
	let pinned = $state<{ x: number; y: number } | null>(null);
	const choose = (name: string) => {
		last = name;
		which = null;
	};
	const row = 'padding: 6px 10px; border-radius: var(--radius-sm); color: var(--text-primary); font-size: var(--text-md)';
</script>

<div style="display: flex; flex-direction: column; gap: 16px">
	<div style="display: flex; flex-direction: row; gap: 12px; align-items: start">
		<Popover open={which === 'actions'} onclose={() => (which = null)}>
			<Button label="Actions" variant="outline" onclick={() => (which = which === 'actions' ? null : 'actions')} />
			{#snippet content()}
				<div style={row} hover="background-color: var(--bg-raised)" onclick={() => choose('Rename')}>Rename</div>
				<div style={row} hover="background-color: var(--bg-raised)" onclick={() => choose('Duplicate')}>Duplicate</div>
				<div style={row} hover="background-color: var(--bg-raised)" onclick={() => choose('Move to…')}>Move to…</div>
			{/snippet}
		</Popover>
		<Popover open={which === 'share'} onclose={() => (which = null)} side="right" align="start">
			<Button label="Share" variant="themed" onclick={() => (which = which === 'share' ? null : 'share')} />
			{#snippet content()}
				<div style="display: flex; flex-direction: column; gap: 8px; padding: 6px; width: 200px">
					<div style="font-size: var(--text-md); font-weight: 600; color: var(--text-primary)">Share link</div>
					<div style="font-size: var(--text-sm); color: var(--text-secondary)">Anyone with the link can view.</div>
					<Button label="Copy link" size="h-md" full onclick={() => choose('Copied link')} />
				</div>
			{/snippet}
		</Popover>
		<Popover open={which === 'sort'} onclose={() => (which = null)} side="top" align="end">
			<Button label="Sort" variant="secondary" onclick={() => (which = which === 'sort' ? null : 'sort')} />
			{#snippet content()}
				<div style={row} hover="background-color: var(--bg-raised)" onclick={() => choose('Name')}>Name</div>
				<div style={row} hover="background-color: var(--bg-raised)" onclick={() => choose('Date modified')}>Date modified</div>
				<div style={row} hover="background-color: var(--bg-raised)" onclick={() => choose('Size')}>Size</div>
			{/snippet}
		</Popover>
	</div>
	<div style="display: flex; flex-direction: row; gap: 12px; align-items: start">
		<Popover open={pinned !== null} onclose={() => (pinned = null)} position={pinned}>
			<Button label="Panel at the pointer" variant="secondary" onclick={(e) => (pinned = pinned ? null : { x: e.x ?? 0, y: e.y ?? 0 })} />
			{#snippet content()}<div style={row} onclick={() => choose('Pinned item')}>Pinned at the click</div>{/snippet}
		</Popover>
	</div>
	<div style="font-size: var(--text-sm); color: var(--text-secondary)">last choice: {last}</div>
</div>
```

## GPUI notes

- The panel is a fixed 1px border, 4px padding and 160px minimum width. Override width or padding through `style`.
- Outside-press detection uses the trigger's painted bounds, so a press on the trigger reaches its own click handler rather than closing the panel first.
- Use `position` for a menu opened at the pointer, with no trigger element to anchor to.
