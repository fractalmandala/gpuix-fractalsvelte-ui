---
title: Tabs
description: Switch between sibling views with an underline or a segmented pill control.
category: navigation
---

`Tabs` shows one panel at a time. The parent owns `value` and handles `onchange`; the optional `children` snippet receives the active id and renders the panel below.

```svelte
<script>
  import Tabs from 'gpuix-fractalsvelte-ui/Tabs.svelte';
  let value = $state('overview');
  const items = [
    { id: 'overview', label: 'Overview' },
    { id: 'activity', label: 'Activity' },
    { id: 'billing', label: 'Billing', disabled: true }
  ];
</script>

<Tabs {items} {value} onchange={(id) => (value = id)}>
  {#snippet children(id)}<div>Showing {id}</div>{/snippet}
</Tabs>
<Tabs {items} {value} variant="pill" size="sm" onchange={(id) => (value = id)} />
```

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `items` | `{ id: string; label: string; disabled?: boolean }[]` | — | Tabs in order. Disabled tabs are skipped by the arrow keys. |
| `value` | `string` | — | The active tab's `id`. |
| `onchange` | `(id: string) => void` | — | Called with the new id, on click or arrow key. |
| `variant` | `'line' \| 'pill'` | `'line'` | `line` underlines the active tab; `pill` is a segmented control. |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Tab heights 26 / 32 / 40 px. |
| `children` | `Snippet<[string]>` | — | The panel, given the active id. |
| `style` | `string` | — | Inline CSS on the root. |
| `testid` | `string` | — | Test id on the root. Each tab gets `<testid>-<id>`. |

## Tokens

`ink`, `ink-muted`, `ink-faint`, `accent`, `accent-soft`, `surface`, `raised`, `border`, `ring`, `radius-sm/md`, `text-sm/md/lg`.

## Keyboard

| Key | Action |
| --- | --- |
| Left, Right | Select and focus the previous or next enabled tab; wraps at the ends |
| Enter, Space | Select the focused tab |

Only the active tab is in the tab order, so Tab moves past the whole row.

## GPUI notes

- The focus ring is a border colour change, since GPUI has no outline.
- The line underline is a 2 px child bar, because GPUI cannot set a single border side's colour.
- Disabled tabs drop their hover rule rather than overriding it, using the `rest` class.
