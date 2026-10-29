---
title: Drawer
description: Panel that slides in from the left, right or bottom over a scrim, with title, body and footer.
category: overlays
---

`Drawer` renders through `Portal` and slides its panel in from an edge. The parent owns `open`; the drawer only asks to close through `onclose`.

```svelte
<script>
  import Drawer from 'gpuix-fractalsvelte-ui/Drawer.svelte';
  import Button from 'gpuix-fractalsvelte-ui/Button.svelte';
  let open = $state(false);
</script>

<Button label="Settings" onclick={() => (open = true)} />
<Drawer {open} side="right" size="sm" title="Settings" onclose={() => (open = false)}>
  Settings body.
  {#snippet footer()}
    <Button label="Apply" onclick={apply} />
  {/snippet}
</Drawer>
```

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `open` | `boolean` | `false` |   |
| `onclose` | `() => void` | — | Called on scrim click, Escape or the ✕ button; the parent sets `open = false`. |
| `side` | `'left' \| 'right' \| 'bottom'` | `'right'` | The edge the panel slides in from. |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Width for `left` and `right`, height for `bottom`. |
| `title` | `string` | `''` |   |
| `dismissable` | `boolean` | `true` | `false` ignores scrim clicks and Escape. |
| `children` | `Snippet` | — |   |
| `footer` | `Snippet` | — | Action row, right-aligned. |
| `style` | `string \| null` | — |   |
| `testid` | `string \| null` | — |   |
## Tokens

`bg-extra`, `bg-raised`, `bg-sunken`, `bg-surface`, `border`, `radius-sm`, `text-lg`, `text-primary`, `text-secondary`
## Keyboard

| Key | Action |
| --- | --- |
| Escape | Close, while open and `dismissable` |

## Examples

Every variant, size and state, exactly as the gallery's Demo view renders them.

```svelte
<script lang="ts">
	import Button from 'gpuix-fractalsvelte-ui/Button.svelte';
	import Drawer from 'gpuix-fractalsvelte-ui/Drawer.svelte';
	type Side = 'left' | 'right' | 'bottom';
	let open = $state(false);
	let locked = $state(false);
	let side = $state<Side>('right');
	let size = $state<'sm' | 'md' | 'lg'>('sm');
	let applied = $state(0);
	const show = (s: Side) => {
		side = s;
		open = true;
	};
</script>

<div style="display: flex; flex-direction: column; gap: 12px">
	<div style="display: flex; flex-direction: row; gap: 8px; align-items: center">
		<Button label="Left" variant="outline" onclick={() => show('left')} />
		<Button label="Right" onclick={() => show('right')} />
		<Button label="Bottom" variant="outline" onclick={() => show('bottom')} />
		<Button label="Locked" variant="outline" onclick={() => (locked = true)} />
		<div style="flex-grow: 1"></div>
		<div style="font-size: var(--text-sm); color: var(--text-secondary)">applied {applied}×</div>
	</div>
	<div style="font-size: var(--text-sm); color: var(--text-secondary)">Size for left and right drawers: sm, md, lg. Escape or a scrim click closes.</div>
	<div style="display: flex; flex-direction: row; gap: 8px">
		{#each ['sm', 'md', 'lg'] as const as s}
			<Button label={s} size="h-md" variant={size === s ? 'primary' : 'outline'} onclick={() => (size = s)} />
		{/each}
	</div>
	<Drawer open={locked} side="left" size="sm" title="Locked" dismissable={false} onclose={() => (locked = false)}>
		Escape and the scrim do nothing here.
		{#snippet footer()}<Button label="Close" onclick={() => (locked = false)} />{/snippet}
	</Drawer>
	<Drawer {open} {side} {size} title="Settings" onclose={() => (open = false)}>
		<div style="font-size: var(--text-md); color: var(--text-primary)">Workspace</div>
		<div>Choose the defaults used for new projects, including the theme, font size and autosave interval.</div>
		<div>Changes apply to every window once you press Apply.</div>
		{#snippet footer()}
			<Button label="Cancel" variant="ghost" onclick={() => (open = false)} />
			<Button label="Apply" onclick={() => { applied++; open = false; }} />
		{/snippet}
	</Drawer>
</div>
```

## GPUI notes

- The Escape listener is registered only while the drawer is open and dismissable.
- The scrim fades in and the panel slides in through `motion`. Durations are 0.2 s.
- The panel has an empty `onclick`, so clicks inside it don't reach the scrim.
- `style` is appended after the size's width or height, so it can override them.
