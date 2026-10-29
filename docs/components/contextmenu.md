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
| `items` | `MenuEntry[]` | — | `MenuEntry` is `{ label, onselect?, disabled?, danger? }` or `{ separator: true }`. `danger` gives a red label. `disabled` items are skipped by arrow keys and clicks. |
| `children` | `Snippet` | — | The region that opens the menu. |
| `style` | `string \| null` | `null` | Inline CSS on the wrapping region. |
| `testid` | `string \| null` | `null` | Test id on the region; `-menu` and `-scrim` suffixes for the menu and its scrim. |

## Tokens

`overlay`, `border`, `ink`, `ink-faint`, `raised`, `danger`, `radius-sm`, `radius-md`, `text-md`.

## Keyboard

Handled while the menu is open. Keys are read window-wide, so focus does not matter.

| Key | Action |
| --- | --- |
| Down, Up | Move the highlight, skipping separators and disabled items |
| Enter | Choose the highlighted item |
| Escape | Close without choosing |

## GPUI notes

- The menu's position is read once, when it opens, from the window size, and clamped so it stays inside the window. The window is assumed not to resize while it is open.
- Right click arrives as `onauxclick` and is checked with `e.isRightClick`. ctrl+click arrives as an ordinary `onclick` with `e.modifiers.ctrl`.
- The region has `hitbox="self"`, so clicks on its children still open the menu.
- The menu has its own empty `onclick`, so clicks on it don't reach the scrim and close it.
