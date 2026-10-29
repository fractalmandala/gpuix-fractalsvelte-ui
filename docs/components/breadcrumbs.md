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
| `items` | `{ label: string; onclick?: () => void }[]` | — | Ancestors with an `onclick` are links; the last item is the current page. |
| `separator` | `string` | `'/'` |   |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Fractalstyler's text sizes. |
| `style` | `string \| null` | — |   |
| `testid` | `string \| null` | — |   |
## Tokens

`bg-raised`, `radius-sm`, `ring`, `text-lg`, `text-md`, `text-muted`, `text-primary`, `text-secondary`, `text-sm`
## Keyboard

| Key | Action |
| --- | --- |
| Tab | Moves between links |
| Enter, Space | Runs the focused link's `onclick` |

## Examples

Every variant, size and state, exactly as the gallery's Demo view renders them.

```svelte
<script lang="ts">
	import Breadcrumbs from 'gpuix-fractalsvelte-ui/Breadcrumbs.svelte';
	let visited = $state('none');
	const go = (name: string) => () => (visited = name);
</script>

<div style="display: flex; flex-direction: column; gap: 16px; align-items: start">
	<Breadcrumbs
		items={[
			{ label: 'Workspace', onclick: go('Workspace') },
			{ label: 'Projects', onclick: go('Projects') },
			{ label: 'Fractal UI' }
		]}
	/>
	<Breadcrumbs
		size="sm"
		separator="›"
		items={[{ label: 'Settings', onclick: go('Settings') }, { label: 'Keyboard' }]}
	/>
	<Breadcrumbs
		size="lg"
		separator="→"
		items={[{ label: 'Docs', onclick: go('Docs') }, { label: 'Components' }]}
	/>
	<div style="color: var(--text-secondary)">last visited: {visited}</div>
</div>
```

## GPUI notes

- Links are focusable only when they have an `onclick`, so the current page is skipped by Tab.
- Don't name a class `link`: this renderer treats it as a reserved name and paints the text green.
