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
| `sections` | `{ title?: string; items: Item[] }[]` | — |   |
| `value` | `string` | — | The active item's id. |
| `onchange` | `(id: string) => void` | — |   |
| `size` | `'h-md' \| 'h-lg' \| 'h-xl'` | `'h-lg'` | Fractalstyler's height steps for each item. |
| `style` | `string \| null` | — |   |
| `testid` | `string \| null` | — |   |
## Tokens

`bg-raised`, `radius-full`, `radius-md`, `ring`, `text-muted`, `text-primary`, `text-secondary`, `text-xs`, `theme-color`, `theme-color-sub`
## Keyboard

| Key | Action |
| --- | --- |
| Up, Down | Select and focus the previous or next enabled item; wraps at the ends |
| Enter, Space | Select the focused item |

## Examples

Every variant, size and state, exactly as the gallery's Demo view renders them.

```svelte
<script lang="ts">
	import NavList from 'gpuix-fractalsvelte-ui/NavList.svelte';
	let value = $state('inbox');
	const sections = [
		{
			title: 'Mail',
			items: [
				{ id: 'inbox', label: 'Inbox', badge: '12', icon: inbox },
				{ id: 'drafts', label: 'Drafts', badge: '2' },
				{ id: 'starred', label: 'Starred' }
			]
		},
		{
			title: 'Account',
			items: [
				{ id: 'general', label: 'General', icon: gear },
				{ id: 'billing', label: 'Billing', disabled: true }
			]
		}
	];
</script>

{#snippet inbox()}<text>✉</text>{/snippet}
{#snippet gear()}<text>⚙</text>{/snippet}

<div style="display: flex; flex-direction: row; gap: 32px">
	<div style="width: 220px"><NavList {sections} {value} onchange={(id) => (value = id)} /></div>
	<div style="width: 180px"><NavList {sections} value="general" size="h-md" /></div>
</div>
```

## GPUI notes

- Icon snippets inherit the row's colour, so a `<text>` glyph follows the active accent.
- Like `Tabs`, focus moves with `focus_element`, which only a live window honours. Headless tests call `focus()` for the same step.
