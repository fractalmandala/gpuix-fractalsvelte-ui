---
title: Link
description: Inline text action with variants, underlined on hover.
category: actions
---

`Link` is a text action that looks like a link. It is a focusable `div`, so it runs an action on click, Enter or Space like `Button`.

```svelte
<script>
  import Link from 'gpuix-fractalsvelte-ui/Link.svelte';
</script>

<Link label="Read the docs" onclick={openDocs} />
<Link variant="danger" size="h-md" label="Remove" onclick={remove} />
<Link disabled label="Unavailable" />
```

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `children` | `Snippet` | — |   |
| `label` | `string` | `''` |   |
| `variant` | `'themed' \| 'secondary' \| 'info' \| 'success' \| 'warning' \| 'danger'` | `'themed'` | Text colour, in fractalstyler's names; `secondary` is plain ink. |
| `size` | `'h-sm' \| 'h-md' \| 'h-bs' \| 'h-lg' \| 'h-xl'` | `'h-bs'` |   |
| `disabled` | `boolean` | `false` |   |
| `onclick` | `(e: GpuixEvent) => void` | — |   |
| `style` | `string \| null` | — |   |
| `testid` | `string \| null` | — |   |
## Tokens

`danger`, `danger-hover`, `info`, `radius-sm`, `ring`, `success`, `text-primary`, `theme-color`, `theme-color-alt`, `warning`
## Keyboard

| Key | Action |
| --- | --- |
| Enter, Space | Activate while focused |

## Examples

Every variant, size and state, exactly as the gallery's Demo view renders them.

```svelte
<script lang="ts">
	import Link from 'gpuix-fractalsvelte-ui/Link.svelte';
	let last = $state('none');
</script>

<div style="display: flex; flex-direction: column; gap: 14px">
	<div style="display: flex; flex-direction: row; gap: 16px; align-items: center">
		{#each ['themed', 'secondary', 'info', 'success', 'warning', 'danger'] as const as variant}
			<Link {variant} label={variant} onclick={() => (last = variant)} />
		{/each}
	</div>
	<div style="display: flex; flex-direction: row; gap: 16px; align-items: center">
		<Link size="h-sm" label="Small" onclick={() => (last = 'small')} />
		<Link size="h-md" label="Medium" onclick={() => (last = 'medium')} />
		<Link size="h-lg" label="Large" onclick={() => (last = 'large')} />
		<Link label="Disabled" disabled />
	</div>
	<div style="color: var(--text-secondary)">last clicked: {last}</div>
</div>
```

## GPUI notes

- The hover underline is `text-decoration`, which GPUI inherits to the text.
- The root hugs its text (`align-self: flex-start`), so only the text is clickable, not the full row.
- The focus ring is a border colour change, since GPUI has no outline.
