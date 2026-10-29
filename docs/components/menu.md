---
title: Menu
description: Dropdown of actions anchored to a trigger, with shortcuts, tones, disabled items and separators.
category: navigation
---

`Menu` opens a panel of actions beside its trigger, using `Popover`. The parent owns `open` and handles `onopenchange`. Selecting an item runs its `onselect` and closes the menu.

```svelte
<script>
  import Menu from 'gpuix-fractalsvelte-ui/Menu.svelte';
  import Button from 'gpuix-fractalsvelte-ui/Button.svelte';
  let open = $state(false);
</script>

<Menu
  {open}
  onopenchange={(o) => (open = o)}
  items={[
    { label: 'Rename', shortcut: '⌘R', onselect: rename },
    { label: 'Duplicate', shortcut: '⌘D', onselect: duplicate },
    { separator: true },
    { label: 'Archive', disabled: true, onselect: archive },
    { label: 'Delete', tone: 'danger', onselect: remove }
  ]}
>
  {#snippet trigger()}<Button label="Actions" variant="outline" tone="neutral" size="sm" />{/snippet}
</Menu>
```

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `items` | `Entry[]` | — | An entry is `{ label; shortcut?; tone?; disabled?; onselect }` or `{ separator: true }`. |
| `trigger` | `Snippet` | — | The content that opens the menu. |
| `open` | `boolean` | `false` | Whether the panel is shown. |
| `onopenchange` | `(open: boolean) => void` | — | Called on trigger click, item pick, Escape or an outside press. |
| `side` | `'top' \| 'bottom'` | `'bottom'` | Which trigger edge the panel hangs from. |
| `align` | `'start' \| 'center' \| 'end'` | `'start'` | Alignment along that edge. |
| `style` | `string` | — | Inline CSS on the panel, such as `min-width: 220px`. |
| `testid` | `string` | — | Test id on the trigger (`<testid>-trigger`) and the panel (`<testid>-panel`). |

`tone` takes `neutral` (default), `accent`, `success`, `warn` or `danger`.

## Tokens

`overlay`, `ink`, `ink-faint`, `border`, `raised`, `danger`, `danger-soft`, `accent`, `success`, `warn`, `ring`, `radius-sm/md`, `font-mono`, `text-xs/md`.

## Keyboard

| Key | Action |
| --- | --- |
| Enter, Space, Down | On the focused trigger: open the menu, with the first item highlighted |
| Down, Up | Move the highlight; skips separators and disabled items, and wraps |
| Enter | Pick the highlighted item |
| Escape | Close without picking |

## GPUI notes

- The trigger must not carry its own `onclick`; a child's click handler would stop the trigger's click from reaching the menu. A `Button` with no `onclick` works.
- The panel is styled inline, because the `Popover` panel otherwise reads its colours from `--popover-*` variables that this library does not set.
- Highlight follows the pointer as well as the arrow keys.
