---
title: Breadcrumbs
description: Trail of ancestor pages, with the last item marked as the current page.
category: navigation
---

`Breadcrumbs` shows where you are. Items with an `onclick` are links; the last item is the current page and is never a link.

```svelte
<script>
  import Breadcrumbs from 'gpuix-fractalsvelte-ui/Breadcrumbs.svelte';
</script>

<Breadcrumbs
  items={[
    { label: 'Home', onclick: goHome },
    { label: 'Projects', onclick: goProjects },
    { label: 'Fractal' }
  ]}
/>
<Breadcrumbs size="sm" separator="›" items={[{ label: 'Settings' }, { label: 'Billing' }]} />
```

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `items` | `{ label: string; onclick?: () => void }[]` | — | Items with `onclick` are links. The last item is the current page. |
| `separator` | `string` | `'/'` | Drawn between items. |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Row heights 22 / 26 / 32 px. |
| `style` | `string` | — | Inline CSS on the root. |
| `testid` | `string` | — | Test id on the root. Each crumb gets `<testid>-<index>`. |

## Tokens

`ink`, `ink-muted`, `ink-faint`, `raised`, `ring`, `radius-sm`, `text-sm/md/lg`.

## Keyboard

| Key | Action |
| --- | --- |
| Tab | Moves between links |
| Enter, Space | Runs the focused link's `onclick` |

## GPUI notes

- Links are focusable only when they have an `onclick`, so the current page is skipped by Tab.
- Don't name a class `link`: this renderer treats it as a reserved name and paints the text green.
