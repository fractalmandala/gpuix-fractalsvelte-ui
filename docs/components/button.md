---
title: Button
description: Clickable action with variants, sizes, shapes, loading and icon slots.
category: actions
---

`Button` runs an action on click, Enter or Space. It is a focusable `div`, so it works anywhere in a GPUI tree.

```svelte
<script>
  import Button from 'gpuix-fractalsvelte-ui/Button.svelte';
</script>

<Button label="Save" onclick={save} />
<Button variant="danger" size="h-md" shape="square">Delete</Button>
<Button variant="ghost" loading={busy} shape="modern" label="Sync" />
```

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `children` | `Snippet` | — | Content; `label` is the plain-text shorthand. |
| `label` | `string` | `''` |   |
| `variant` | `'primary' \| 'secondary' \| 'themed' \| 'outline' \| 'ghost' \| 'link' \| 'info' \| 'success' \| 'warning' \| 'danger'` | `'primary'` | Fractalstyler's variant axis. |
| `size` | `'h-sm' \| 'h-md' \| 'h-bs' \| 'h-lg' \| 'h-xl'` | `'h-bs'` | Fractalstyler's size axis. |
| `shape` | `'square' \| 'min' \| 'modern' \| 'curved' \| 'round'` | `'min'` |   |
| `disabled` | `boolean` | `false` |   |
| `loading` | `boolean` | `false` | Shows `…` in place of the content and swallows clicks. |
| `full` | `boolean` | `false` | Stretches to the parent's width. |
| `leading` | `Snippet` | — | Snippet before the content, usually an icon. |
| `trailing` | `Snippet` | — |   |
| `onclick` | `(e: GpuixEvent) => void` | — |   |
| `style` | `string \| null` | — |   |
| `testid` | `string \| null` | — |   |
## Tokens

None; the component takes its colours from the element it sits in.
## Keyboard

| Key | Action |
| --- | --- |
| Enter, Space | Activate while focused |

## Examples

Every variant, size and state, exactly as the gallery's Demo view renders them.

```svelte
<script lang="ts">
	import Button from 'gpuix-fractalsvelte-ui/Button.svelte';
	let clicks = $state(0);
	const variants = ['primary', 'secondary', 'themed', 'outline', 'ghost', 'link', 'info', 'success', 'warning', 'danger'] as const;
	const shapes = ['square', 'min', 'modern', 'curved', 'round'] as const;
	const sizes = ['h-sm', 'h-md', 'h-bs', 'h-lg', 'h-xl'] as const;

</script>

{#snippet plus()}<div>+</div>{/snippet}
{#snippet arrow()}<div>→</div>{/snippet}

<div style="display: flex; flex-direction: column; gap: 20px">
	<div style="display: flex; flex-direction: row; flex-wrap: wrap; gap: 8px">
		{#each variants as v}
			<Button variant={v} label={v} onclick={() => clicks++} />
		{/each}
	</div>
	<div style="display: flex; flex-direction: row; gap: 8px; align-items: center">
		{#each shapes as s}
			<Button shape={s} label={s} />
		{/each}
	</div>
	<div style="display: flex; flex-direction: row; gap: 8px; align-items: center">
		{#each sizes as z}
			<Button size={z} label={z} />
		{/each}
	</div>
	<div style="display: flex; flex-direction: row; gap: 8px; align-items: center">
		<Button label="Save" leading={plus} />
		<Button label="Next" trailing={arrow} />
		<Button label="Full width" full />
	</div>
	<div style="display: flex; flex-direction: row; gap: 8px; align-items: center">
		<Button label="Disabled" disabled />
		<Button label="Loading" loading />
	</div>
	<div>clicks: {clicks}</div>
</div>
```

## GPUI notes

- The focus ring is a border colour change, since GPUI has no outline or shadow.
- Disabled buttons drop their hover rule rather than overriding it, because a `:hover` rule outranks a plain class.
