---
title: IconButton
description: Square icon-only action with a hover tooltip, sharing Button's variants, tones and sizes.
category: actions
---

`IconButton` is a square `Button` for a single icon. Give it a `label` and hovering shows a tooltip. Like `Button`, it is a focusable `div`.

```svelte
<script>
  import IconButton from 'gpuix-fractalsvelte-ui/IconButton.svelte';
</script>

<IconButton glyph="+" label="Add" onclick={add} />
<IconButton variant="soft" tone="danger" label="Delete">
  {#snippet children()}🗑{/snippet}
</IconButton>
<IconButton glyph="✕" size="sm" disabled />
```

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `glyph` | `string` | `''` | Plain-text icon. Ignored when `children` is given. |
| `children` | `Snippet` | — | Rich icon content. |
| `label` | `string` | `''` | Tooltip text, shown after a short hover. |
| `variant` | `'solid' \| 'soft' \| 'outline' \| 'ghost'` | `'ghost'` | Visual weight. |
| `tone` | `'accent' \| 'neutral' \| 'success' \| 'warn' \| 'danger'` | `'neutral'` | Colour role. |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Squares of 26 / 32 / 40 px. |
| `disabled` | `boolean` | `false` | Dims, drops hover, leaves the tab order, ignores clicks. |
| `onclick` | `(e) => void` | — | Also fires on Enter and Space while focused. |
| `style` | `string` | — | Inline CSS; wins over the component's rules. |
| `testid` | `string` | — | Test id on the button. |

## Tokens

The same colour roles as `Button` (`accent*`, `danger*`, `success*`, `warn*`, `raised`, `border`, `border-strong`, `ink`, `ink-muted`, `ring`), plus `radius-sm/md/lg`, `text-sm/md/lg`.

## Keyboard

| Key | Action |
| --- | --- |
| Enter, Space | Activate while focused |

## GPUI notes

- The tooltip wraps the button with `Tooltip` and spreads its hover handlers onto the button. A button with its own `onclick` would otherwise block the hover.
- The focus ring is a border colour change, since GPUI has no outline or shadow.
- Disabled buttons drop their hover rule rather than overriding it.
