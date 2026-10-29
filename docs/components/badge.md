---
title: Badge
description: Small pill label for counts, statuses and tags, in five tones and three variants.
category: feedback
---

`Badge` is a non-interactive pill. Use `label` for plain text, or pass children for rich content.

```svelte
<script>
  import Badge from 'gpuix-fractalsvelte-ui/Badge.svelte';
</script>

<Badge label="New" tone="accent" />
<Badge label="3 errors" tone="danger" variant="solid" />
<Badge label="Draft" tone="neutral" variant="outline" size="sm" />
```

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `label` | `string` | `''` | Plain-text content. Ignored when `children` is given. |
| `children` | `Snippet` | — | Rich content. |
| `tone` | `'accent' \| 'neutral' \| 'success' \| 'warn' \| 'danger'` | `'neutral'` | Colour role. |
| `variant` | `'solid' \| 'soft' \| 'outline'` | `'soft'` | `solid` fills, `soft` tints, `outline` draws a border. |
| `size` | `'sm' \| 'md'` | `'md'` | Heights 18 / 22 px. |
| `style` | `string \| null` | `null` | Inline CSS on the root. |
| `testid` | `string \| null` | `null` | Test id on the root. |

## Tokens

`accent`, `accent-ink`, `accent-soft`, `bg`, `ink`, `ink-muted`, `raised`, `border-strong`, `success`, `success-ink`, `success-soft`, `warn`, `warn-ink`, `warn-soft`, `danger`, `danger-ink`, `danger-soft`, `radius-full`, `text-xs`, `text-sm`.

## GPUI notes

- Each tone and variant pair is its own compound class (`.badge.solid.accent`), because GPUI has no nesting.
- The base rule sets a transparent border, so only the `outline` variant shows a border.
