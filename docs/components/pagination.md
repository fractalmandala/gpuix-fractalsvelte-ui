---
title: Pagination
description: Page controls with previous and next buttons and a windowed run of page numbers around the current page.
category: navigation
---

`Pagination` shows page numbers around the current page, with ellipses for the gaps. The parent owns `page` and handles `onchange`.

```svelte
<script>
  import Pagination from 'gpuix-fractalsvelte-ui/Pagination.svelte';
  let page = $state(1);
</script>

<Pagination {page} total={24} onchange={(p) => (page = p)} />
<Pagination {page} total={5} siblings={2} size="sm" onchange={(p) => (page = p)} />
```

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `page` | `number` | — | The current page, from 1. |
| `total` | `number` | — | The number of pages. |
| `siblings` | `number` | `1` | Pages shown on each side of the current one. The first and last page are always shown. |
| `onchange` | `(page: number) => void` | — | Called with the new page; not called for the current page or past either end. |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Control heights 26 / 32 / 40 px. |
| `style` | `string` | — | Inline CSS on the root. |
| `testid` | `string` | — | Test id on the root. Parts get `<testid>-prev`, `<testid>-next` and `<testid>-<page>`. |

## Tokens

Via `Button`: `accent`, `accent-ink`, `raised`, `ink`, `ink-muted`, `ink-faint`, `radius-sm/md`, `text-sm/md/lg`.

## Keyboard

| Key | Action |
| --- | --- |
| Tab | Moves between the controls |
| Enter, Space | Goes to the focused page, or to previous or next |

## GPUI notes

- Built from `Button`, so the controls share its focus ring and disabled behaviour.
- Page buttons get a minimum width matching the height, so one-digit and two-digit pages line up.
