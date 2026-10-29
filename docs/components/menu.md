---
title: Menu
description: Dropdown of actions anchored to a trigger, with shortcuts, variants, disabled items and separators.
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
    { label: 'Delete', variant: 'danger', onselect: remove }
  ]}
>
  {#snippet trigger()}<Button label="Actions" size="h-sm" />{/snippet}
</Menu>
```

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `items` | `Entry[]` | — |   |
| `trigger` | `Snippet` | — | The trigger's content. Keep it free of its own `onclick`, or the trigger's click never reaches the menu. |
| `open` | `boolean` | `false` |   |
| `onopenchange` | `(open: boolean) => void` | — |   |
| `side` | `'top' \| 'bottom'` | `'bottom'` |   |
| `align` | `'start' \| 'center' \| 'end'` | `'start'` |   |
| `style` | `string \| null` | — | Inline CSS for the panel, e.g. `min-width: 220px`. |
| `testid` | `string \| null` | — |   |
## Tokens

`bg-raised`, `border`, `danger`, `danger-soft`, `font-mono`, `info`, `radius-md`, `radius-sm`, `ring`, `success`, `text-md`, `text-muted`, `text-primary`, `text-xs`, `theme-color`, `warning`
## Keyboard

| Key | Action |
| --- | --- |
| Enter, Space, Down | On the focused trigger: open the menu, with the first item highlighted |
| Down, Up | Move the highlight; skips separators and disabled items, and wraps |
| Enter | Pick the highlighted item |
| Escape | Close without picking |

## Examples

Every variant, size and state, exactly as the gallery's Demo view renders them.

```svelte
<script lang="ts">
	import Menu from 'gpuix-fractalsvelte-ui/Menu.svelte';
	import Button from 'gpuix-fractalsvelte-ui/Button.svelte';
	let open = $state(false);
	let picked = $state('nothing');
	const pick = (name: string) => () => (picked = name);
</script>

<div style="display: flex; flex-direction: column; gap: 12px">
	<div style="display: flex; flex-direction: row; gap: 24px; align-items: start">
		<Menu
			{open}
			onopenchange={(o) => (open = o)}
			style="min-width: 220px"
			items={[
				{ label: 'Rename', shortcut: '⌘R', onselect: pick('Rename') },
				{ label: 'Duplicate', shortcut: '⌘D', onselect: pick('Duplicate') },
				{ label: 'Share…', onselect: pick('Share') },
				{ separator: true },
				{ label: 'Archive', disabled: true, onselect: pick('Archive') },
				{ label: 'Delete', shortcut: '⌫', variant: 'danger', onselect: pick('Delete') }
			]}
		>
			{#snippet trigger()}<Button label="Actions" variant="outline" />{/snippet}
		</Menu>
		<Menu side="top" items={[{ label: 'Above the trigger', onselect: pick('Above') }]}>
			{#snippet trigger()}<Button label="Open upward" variant="outline" />{/snippet}
		</Menu>
		<div style="color: var(--text-secondary); padding-top: 8px">picked: {picked}</div>
	</div>
</div>
```

## GPUI notes

- The trigger must not carry its own `onclick`; a child's click handler would stop the trigger's click from reaching the menu. A `Button` with no `onclick` works.
- The panel is styled inline, because the `Popover` panel otherwise reads its colours from `--popover-*` variables that this library does not set.
- Highlight follows the pointer as well as the arrow keys.
