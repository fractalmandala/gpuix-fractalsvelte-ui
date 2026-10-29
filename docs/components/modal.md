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

<Button label="Delete" tone="danger" onclick={() => (open = true)} />
<Modal {open} onclose={() => (open = false)} title="Delete file?" size="sm">
  This cannot be undone.
  {#snippet footer()}
    <Button label="Cancel" variant="ghost" tone="neutral" onclick={() => (open = false)} />
    <Button label="Delete" tone="danger" onclick={remove} />
  {/snippet}
</Modal>
```

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `open` | `boolean` | `false` | Shown while true. |
| `onclose` | `() => void` | — | Scrim click, Escape or the ✕ button. |
| `title` | `string` | `''` | Header text; no header (and no ✕) when empty. |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Widths 360 / 480 / 640 px. |
| `dismissable` | `boolean` | `true` | `false` ignores scrim, Escape and hides ✕. |
| `children` | `Snippet` | — | Body. |
| `footer` | `Snippet` | — | Right-aligned action row. |
| `style` | `string` | — | Inline CSS on the dialog box. |
| `testid` | `string` | — | Dialog; `-scrim` and `-close` suffixes for the parts. |

## Tokens

`overlay`, `scrim`, `surface`, `border`, `ink`, `ink-muted`, `raised`, `radius-sm`, `radius-lg`, `text-lg`.

## Keyboard

| Key | Action |
| --- | --- |
| Escape | Close (when `dismissable`) |

## GPUI notes

- A dialog needs an `onclick` of its own so clicks inside it don't reach the scrim; the component handles this.
- There is no enter/exit animation yet.
