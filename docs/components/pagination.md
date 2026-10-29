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
<Pagination {page} total={5} siblings={2} size="h-sm" onchange={(p) => (page = p)} />
```

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `page` | `number` | — | The current page, from 1. |
| `total` | `number` | — |   |
| `siblings` | `number` | `1` | Pages shown either side of the current one. |
| `onchange` | `(page: number) => void` | — |   |
| `size` | `'h-sm' \| 'h-md' \| 'h-bs' \| 'h-lg' \| 'h-xl'` | `'h-md'` | Fractalstyler's height steps for the buttons. |
| `style` | `string \| null` | — |   |
| `testid` | `string \| null` | — |   |
## Tokens

`text-muted`
## Keyboard

| Key | Action |
| --- | --- |
| Tab | Moves between the controls |
| Enter, Space | Goes to the focused page, or to previous or next |

## Examples

Every variant, size and state, exactly as the gallery's Demo view renders them.

```svelte
<script lang="ts">
	import Pagination from 'gpuix-fractalsvelte-ui/Pagination.svelte';
	let page = $state(1);
	let wide = $state(7);
	let small = $state(2);
</script>

<div style="display: flex; flex-direction: column; gap: 16px; align-items: start">
	<Pagination {page} total={24} onchange={(p) => (page = p)} />
	<Pagination page={wide} total={24} siblings={2} onchange={(p) => (wide = p)} />
	<Pagination page={small} total={5} size="h-sm" onchange={(p) => (small = p)} />
	<Pagination page={3} total={3} size="h-lg" />
	<div style="color: var(--text-secondary)">page {page}</div>
</div>
```

## GPUI notes

- Built from `Button`, so the controls share its focus ring and disabled behaviour.
- Page buttons get a minimum width matching the height, so one-digit and two-digit pages line up.
