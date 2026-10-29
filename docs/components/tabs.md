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
<Tabs {items} {value} variant="pill" size="h-md" onchange={(id) => (value = id)} />
```

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `items` | `{ id: string; label: string; disabled?: boolean }[]` | — |   |
| `value` | `string` | — | The active tab's id. |
| `onchange` | `(id: string) => void` | — |   |
| `variant` | `'line' \| 'pill'` | `'line'` | `line` underlines the active tab; `pill` is a segmented control. |
| `size` | `'h-sm' \| 'h-md' \| 'h-bs' \| 'h-lg' \| 'h-xl'` | `'h-bs'` | Fractalstyler's height steps for each tab. |
| `children` | `Snippet<[string]>` | — | The panel under the tabs, given the active id. |
| `style` | `string \| null` | — |   |
| `testid` | `string \| null` | — |   |
## Tokens

`bg-raised`, `bg-surface`, `border`, `radius-md`, `ring`, `text-primary`, `text-secondary`, `theme-color`
## Keyboard

| Key | Action |
| --- | --- |
| Left, Right | Select and focus the previous or next enabled tab; wraps at the ends |
| Enter, Space | Select the focused tab |

Only the active tab is in the tab order, so Tab moves past the whole row.

## Examples

Every variant, size and state, exactly as the gallery's Demo view renders them.

```svelte
<script lang="ts">
	import Tabs from 'gpuix-fractalsvelte-ui/Tabs.svelte';
	let line = $state('overview');
	let pill = $state('day');
	let small = $state('code');
	const items = [
		{ id: 'overview', label: 'Overview' },
		{ id: 'activity', label: 'Activity' },
		{ id: 'billing', label: 'Billing', disabled: true },
		{ id: 'settings', label: 'Settings' }
	];
	const periods = [
		{ id: 'day', label: 'Day' },
		{ id: 'week', label: 'Week' },
		{ id: 'month', label: 'Month' }
	];
</script>

<div style="display: flex; flex-direction: column; gap: 24px; width: 420px">
	<Tabs {items} value={line} onchange={(id) => (line = id)}>
		{#snippet children(id)}<div style="color: var(--text-secondary)">Showing {id}.</div>{/snippet}
	</Tabs>
	<div style="display: flex; flex-direction: row; gap: 16px; align-items: center">
		<Tabs items={periods} value={pill} variant="pill" onchange={(id) => (pill = id)} />
		<Tabs items={periods} value={small} variant="pill" size="h-md" onchange={(id) => (small = id)} />
	</div>
</div>
```

## GPUI notes

- The focus ring is a border colour change, since GPUI has no outline.
- The line underline is a 2 px child bar, because GPUI cannot set a single border side's colour.
- Disabled tabs drop their hover rule rather than overriding it, using the `rest` class.
