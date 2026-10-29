---
title: Link
description: Inline text action with tones, underlined on hover.
category: actions
---

`Link` is a text action that looks like a link. It is a focusable `div`, so it runs an action on click, Enter or Space like `Button`.

```svelte
<script>
  import Link from 'gpuix-fractalsvelte-ui/Link.svelte';
</script>

<Link label="Read the docs" onclick={openDocs} />
<Link tone="danger" size="sm" label="Remove" onclick={remove} />
<Link tone="neutral" disabled label="Unavailable" />
```

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `label` | `string` | `''` | Plain-text content. Ignored when `children` is given. |
| `children` | `Snippet` | — | Rich content. |
| `tone` | `'accent' \| 'neutral' \| 'success' \| 'warn' \| 'danger'` | `'accent'` | Text colour; `neutral` is plain ink. |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Type sizes `text-sm`, `text-md`, `text-lg`. |
| `disabled` | `boolean` | `false` | Dims, drops the hover underline, ignores clicks. |
| `onclick` | `(e) => void` | — | Also fires on Enter and Space while focused. |
| `style` | `string` | — | Inline CSS; wins over the component's rules. |
| `testid` | `string` | — | Test id on the root. |

## Tokens

`accent`, `accent-hover`, `danger`, `danger-hover`, `success`, `warn`, `ink`, `ring`, `radius-sm`, `text-sm/md/lg`.

## Keyboard

| Key | Action |
| --- | --- |
| Enter, Space | Activate while focused |

## GPUI notes

- The hover underline is `text-decoration`, which GPUI inherits to the text.
- The root hugs its text (`align-self: flex-start`), so only the text is clickable, not the full row.
- The focus ring is a border colour change, since GPUI has no outline.
