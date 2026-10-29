---
title: Card
description: Surface with a header, body and footer, optionally clickable as a whole.
category: layout
---

`Card` groups related content under an optional title and description, with slots for header actions and footer buttons. With `clickable` the whole card becomes one action.

```svelte
<script>
  import Card from 'gpuix-fractalsvelte-ui/Card.svelte';
  import Button from 'gpuix-fractalsvelte-ui/Button.svelte';
</script>

<Card title="Project" description="Last edited 2h ago">
  Body copy for the card.
  {#snippet actions()}
    <Button label="Star" variant="ghost" tone="neutral" size="sm" onclick={star} />
  {/snippet}
  {#snippet footer()}
    <Button label="Open" size="sm" onclick={open} />
  {/snippet}
</Card>

<Card title="Recent file" clickable onclick={openFile}>Click anywhere to open.</Card>
```

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `children` | `Snippet` | — | Body content. |
| `title` | `string` | `''` | Header title. |
| `description` | `string` | `''` | Muted line under the title. |
| `actions` | `Snippet` | — | Right side of the header, e.g. icon buttons. |
| `footer` | `Snippet` | — | Row under the body with a top border, right-aligned. |
| `padding` | `'sm' \| 'md' \| 'lg' \| number` | `'lg'` | Scale is 4 / 8 / 16 px; a number is px. |
| `clickable` | `boolean` | `false` | Hover highlight, focus ring, and `onclick` on click, Enter or Space. |
| `onclick` | `(e: GpuixEvent) => void` | — | Only wired when `clickable`. |
| `style` | `string \| null` | `null` | Inline CSS on the root, appended after `padding`. |
| `testid` | `string \| null` | `null` | Test id on the root. |

## Tokens

`surface`, `raised`, `ink`, `ink-muted`, `border`, `ring`, `radius-lg`, `text-sm`, `text-lg`.

## Keyboard

| Key | Action |
| --- | --- |
| Enter, Space | Run `onclick` while focused (only when `clickable`) |

## GPUI notes

- A clickable card is focusable (`tabindex` 0). Its focus ring is a border colour change.
- The `actions` and `footer` rows sit on a near-transparent fill with an `onclick` that does nothing. This stops a button's click from also running the card's `onclick`.
- Only the `clickable` card gets a `cursor: pointer` and hover background.
