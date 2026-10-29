---
title: NavList
description: Vertical sidebar list with section headings, optional icons and badges.
category: navigation
---

`NavList` is a sidebar of sections and items. The parent owns `value` and handles `onchange`. An item can carry an `icon` snippet and a short `badge` text.

```svelte
<script>
  import NavList from 'gpuix-fractalsvelte-ui/NavList.svelte';
  let value = $state('inbox');
  const sections = [
    { title: 'Mail', items: [
      { id: 'inbox', label: 'Inbox', badge: '12' },
      { id: 'drafts', label: 'Drafts' }
    ] },
    { title: 'Account', items: [
      { id: 'billing', label: 'Billing', disabled: true }
    ] }
  ];
</script>

<NavList {sections} {value} onchange={(id) => (value = id)} />
```

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `sections` | `{ title?: string; items: Item[] }[]` | — | `Item` is `{ id; label; icon?: Snippet; badge?: string; disabled?: boolean }`. |
| `value` | `string` | — | The active item's `id`. |
| `onchange` | `(id: string) => void` | — | Called with the new id, on click, Enter, Space or an arrow key. |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Row heights 26 / 32 / 40 px. |
| `style` | `string` | — | Inline CSS on the root. |
| `testid` | `string` | — | Test id on the root. Each item gets `<testid>-<id>`. |

## Tokens

`accent`, `accent-soft`, `ink`, `ink-muted`, `ink-faint`, `raised`, `ring`, `radius-md/full`, `text-xs/sm/md/lg`.

## Keyboard

| Key | Action |
| --- | --- |
| Up, Down | Select and focus the previous or next enabled item; wraps at the ends |
| Enter, Space | Select the focused item |

## GPUI notes

- Icon snippets inherit the row's colour, so a `<text>` glyph follows the active accent.
- Like `Tabs`, focus moves with `focus_element`, which only a live window honours. Headless tests call `focus()` for the same step.
