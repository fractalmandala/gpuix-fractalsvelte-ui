---
title: Alert
description: Inline status message with a tone, optional title and a dismiss control.
category: feedback
---

`Alert` shows a message in a tinted box with a coloured dot. Pass `onclose` to add a ✕ control; the parent removes the alert when it runs.

```svelte
<script>
  import Alert from 'gpuix-fractalsvelte-ui/Alert.svelte';
  let saved = $state(true);
</script>

{#if saved}
  <Alert title="Saved" tone="success" onclose={() => (saved = false)}>Your changes are live.</Alert>
{/if}
<Alert tone="danger">Sync failed: the server did not respond.</Alert>
```

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `title` | `string` | `''` | Bold line above the body. Omitted when empty. |
| `tone` | `'accent' \| 'neutral' \| 'success' \| 'warn' \| 'danger'` | `'accent'` | Border, tint and dot colour. |
| `children` | `Snippet` | — | Body text under the title. |
| `onclose` | `() => void` | — | Shows the ✕ control. The parent removes the alert. |
| `style` | `string \| null` | `null` | Inline CSS on the root. |
| `testid` | `string \| null` | `null` | Test id on the root; the ✕ gets `${testid}-close`. |

## Tokens

`accent`, `accent-soft`, `raised`, `border-strong`, `success`, `success-soft`, `warn`, `warn-soft`, `danger`, `danger-soft`, `ink`, `ink-muted`, `ring`, `radius-sm`, `radius-md`, `radius-full`, `text-sm`.

## Keyboard

| Key | Action |
| --- | --- |
| Enter, Space | Dismiss, while the ✕ control is focused |

## GPUI notes

- The ✕ is a focusable `div`, not a button. Its focus ring is a border colour change, since GPUI has no outline.
- The ✕ has its own `onclick`, so clicking it does not reach any ancestor handlers.
