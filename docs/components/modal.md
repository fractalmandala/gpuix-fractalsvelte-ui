---
title: Modal
description: Centred dialog over a scrim, with title, body and footer actions.
category: overlays
---

`Modal` renders through `Portal`, so it paints over everything wherever you place it. The parent owns `open`; the modal only asks to close through `onclose`.

```svelte
<script>
  import Modal from 'gpuix-fractalsvelte-ui/Modal.svelte';
  import Button from 'gpuix-fractalsvelte-ui/Button.svelte';
  let open = $state(false);
</script>

<Button label="Delete" variant="danger" onclick={() => (open = true)} />
<Modal {open} onclose={() => (open = false)} title="Delete file?" size="sm">
  This cannot be undone.
  {#snippet footer()}
    <Button label="Cancel" variant="ghost" onclick={() => (open = false)} />
    <Button label="Delete" variant="danger" onclick={remove} />
  {/snippet}
</Modal>
```

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `open` | `boolean` | `false` |   |
| `onclose` | `() => void` | — | Called on scrim click, Escape or the close button; the parent sets `open = false`. |
| `title` | `string` | `''` |   |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Dialog width: sm 360, md 480, lg 640. |
| `dismissable` | `boolean` | `true` | `false` ignores scrim clicks and Escape. |
| `children` | `Snippet` | — |   |
| `footer` | `Snippet` | — | Action row, right-aligned. |
| `style` | `string \| null` | — |   |
| `testid` | `string \| null` | — |   |
## Tokens

`bg-extra`, `bg-raised`, `bg-sunken`, `bg-surface`, `border`, `radius-lg`, `radius-sm`, `text-lg`, `text-primary`, `text-secondary`
## Keyboard

| Key | Action |
| --- | --- |
| Escape | Close (when `dismissable`) |

## Examples

Every variant, size and state, exactly as the gallery's Demo view renders them.

```svelte
<script lang="ts">
	import Button from 'gpuix-fractalsvelte-ui/Button.svelte';
	import Modal from 'gpuix-fractalsvelte-ui/Modal.svelte';
	let open = $state(false);
	let small = $state(false);
</script>

<div style="display: flex; flex-direction: row">
	<Button label="Open modal" onclick={() => (open = true)} />
	<Button label="Small, not dismissable" variant="outline" onclick={() => (small = true)} />
</div>
<Modal {open} onclose={() => (open = false)} title="Publish changes?">
	Your edits will be visible to everyone with access.
	{#snippet footer()}
		<Button label="Cancel" variant="ghost" onclick={() => (open = false)} />
		<Button label="Publish" onclick={() => (open = false)} />
	{/snippet}
</Modal>
<Modal open={small} onclose={() => (small = false)} title="Locked" size="sm" dismissable={false}>
	Escape and the scrim do nothing here.
	{#snippet footer()}
		<Button label="Close" onclick={() => (small = false)} />
	{/snippet}
</Modal>
```

## GPUI notes

- A dialog needs an `onclick` of its own so clicks inside it don't reach the scrim; the component handles this.
- There is no enter/exit animation yet.
