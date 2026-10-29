---
title: ContextMenu
description: Wraps a region and opens a menu of actions on right click or ctrl+click.
category: overlays
---

`ContextMenu` wraps any region. A right click, or ctrl+click on macOS, opens a menu at the pointer. The menu is drawn through `Portal` and closes on choice, scrim click, right click or Escape.

```svelte
<script>
  import ContextMenu, { type MenuEntry } from 'gpuix-fractalsvelte-ui/ContextMenu.svelte';

  const items: MenuEntry[] = [
    { label: 'Copy', onselect: copy },
    { label: 'Paste', onselect: paste },
    { separator: true },
    { label: 'Delete', danger: true, onselect: remove }
  ];
</script>

<ContextMenu {items}>
  <div>Right-click here</div>
</ContextMenu>
```

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `items` | `MenuEntry[]` | — |   |
| `children` | `Snippet` | — | The region that opens the menu on a right click, or ctrl+click on macOS. |
| `style` | `string \| null` | — |   |
| `testid` | `string \| null` | — |   |
## Tokens

`bg-raised`, `bg-sunken`, `border`, `danger`, `radius-md`, `radius-sm`, `text-md`, `text-muted`, `text-primary`
## Keyboard

Handled while the menu is open. Keys are read window-wide, so focus does not matter.

| Key | Action |
| --- | --- |
| Down, Up | Move the highlight, skipping separators and disabled items |
| Enter | Choose the highlighted item |
| Escape | Close without choosing |

## Examples

Every variant, size and state, exactly as the gallery's Demo view renders them.

```svelte
<script lang="ts">
	import ContextMenu, { type MenuEntry } from 'gpuix-fractalsvelte-ui/ContextMenu.svelte';
	let last = $state('none');
	const pick = (name: string) => () => (last = name);
	const items: MenuEntry[] = [
		{ label: 'Cut', onselect: pick('Cut') },
		{ label: 'Copy', onselect: pick('Copy') },
		{ label: 'Paste', onselect: pick('Paste') },
		{ separator: true },
		{ label: 'Rename', onselect: pick('Rename') },
		{ label: 'Duplicate', disabled: true, onselect: pick('Duplicate') },
		{ separator: true },
		{ label: 'Delete', danger: true, onselect: pick('Delete') }
	];
</script>

<div style="display: flex; flex-direction: column; gap: 12px">
	<ContextMenu
		{items}
		style="height: 150px; align-items: center; justify-content: center; background-color: var(--bg-surface); border-width: 1px; border-color: var(--border); border-radius: var(--radius-lg)"
	>
		<div style="font-size: var(--text-md); color: var(--text-primary)">Right-click anywhere in this panel</div>
	</ContextMenu>
	<div style="font-size: var(--text-sm); color: var(--text-secondary)">last action: {last}</div>
</div>
```

## GPUI notes

- The menu's position is read once, when it opens, from the window size, and clamped so it stays inside the window. The window is assumed not to resize while it is open.
- Right click arrives as `onauxclick` and is checked with `e.isRightClick`. ctrl+click arrives as an ordinary `onclick` with `e.modifiers.ctrl`.
- The region has `hitbox="self"`, so clicks on its children still open the menu.
- The menu has its own empty `onclick`, so clicks on it don't reach the scrim and close it.
