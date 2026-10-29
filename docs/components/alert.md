---
title: Alert
description: Inline status message with a variant, optional title and a dismiss control.
category: feedback
---

`Alert` shows a message in a tinted box with a coloured dot. Pass `onclose` to add a ✕ control; the parent removes the alert when it runs.

```svelte
<script>
  import Alert from 'gpuix-fractalsvelte-ui/Alert.svelte';
  let saved = $state(true);
</script>

{#if saved}
  <Alert title="Saved" variant="success" onclose={() => (saved = false)}>Your changes are live.</Alert>
{/if}
<Alert variant="danger">Sync failed: the server did not respond.</Alert>
```

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `title` | `string` | `''` |   |
| `variant` | `'info' \| 'secondary' \| 'success' \| 'warning' \| 'danger'` | `'info'` | Fractalstyler's status names. |
| `children` | `Snippet` | — | Body content under the title. |
| `onclose` | `() => void` | — | Shows a dismiss button; the parent removes the alert. |
| `style` | `string \| null` | — |   |
| `testid` | `string \| null` | — |   |
## Tokens

`bg-raised`, `border-strong`, `danger`, `danger-soft`, `info`, `info-soft`, `radius-full`, `radius-md`, `radius-sm`, `ring`, `success`, `success-soft`, `text-primary`, `text-secondary`, `text-sm`, `warning`, `warning-soft`
## Keyboard

| Key | Action |
| --- | --- |
| Enter, Space | Dismiss, while the ✕ control is focused |

## Examples

Every variant, size and state, exactly as the gallery's Demo view renders them.

```svelte
<script lang="ts">
	import Alert from 'gpuix-fractalsvelte-ui/Alert.svelte';
	import Button from 'gpuix-fractalsvelte-ui/Button.svelte';
	let shown = $state(true);
</script>

<div style="display: flex; flex-direction: column; gap: 12px; width: 460px">
	{#if shown}
		<Alert title="Export complete" variant="success" onclose={() => (shown = false)}>Saved 12 files to ~/Documents/export.</Alert>
	{/if}
	<Alert title="Update available" variant="info">Version 1.4 adds faster search.</Alert>
	<Alert title="Disk almost full" variant="warning">Free some space before exporting.</Alert>
	<Alert title="Sync failed" variant="danger">The server did not respond. Try again.</Alert>
	<Alert variant="secondary">Plain note without a title.</Alert>
	{#if !shown}
		<Button label="Show again" size="h-md" variant="outline" onclick={() => (shown = true)} />
	{/if}
</div>
```

## GPUI notes

- The ✕ is a focusable `div`, not a button. Its focus ring is a border colour change, since GPUI has no outline.
- The ✕ has its own `onclick`, so clicking it does not reach any ancestor handlers.
