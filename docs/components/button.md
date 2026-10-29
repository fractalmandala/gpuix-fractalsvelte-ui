---
title: Button
description: Clickable action with variants, tones, sizes, loading and icon slots.
category: actions
---

`Button` runs an action on click, Enter or Space. It is a focusable `div`, so it works anywhere in a GPUI tree.

```svelte
<script>
  import Button from 'gpuix-fractalsvelte-ui/Button.svelte';
</script>

<Button label="Save" onclick={save} />
<Button variant="outline" tone="danger" size="sm" shape="rect">Delete</Button>
<Button variant="ghost" tone="neutral" loading={busy} shape="modern" label="Sync" />
```

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `label` | `string` | `''` | Plain-text content. Ignored when `children` is given. |
| `children` | `Snippet` | — | Rich content. |
| `variant` | `'solid' \| 'soft' \| 'outline' \| 'ghost'` | `'solid'` | Visual weight. |
| `tone` | `'accent' \| 'neutral' \| 'success' \| 'warn' \| 'danger'` | `'accent'` | Colour role. |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Heights 26 / 32 / 40 px. |
| `shape` | `'rect' \| 'min' \| 'modern' \| 'curved' \| 'round'` | `'rect'` | Border-radius 0 / 4 / 8 / 14 / 9999px. |
| `disabled` | `boolean` | `false` | Dims, drops hover, leaves the tab order, ignores clicks. |
| `loading` | `boolean` | `false` | Shows `…` and ignores clicks. |
| `full` | `boolean` | `false` | Full width of the parent. |
| `leading` / `trailing` | `Snippet` | — | Icons or badges either side of the content. |
| `onclick` | `(e) => void` | — | Also fires on Enter and Space while focused. |
| `style` | `string` | — | Inline CSS; wins over the component's rules. |
| `testid` | `string` | — | Test id on the root. |

## Tokens

`accent`, `accent-hover`, `accent-ink`, `accent-soft`, the same four for `danger`, `success-*`, `warn-*`, `raised`, `border`, `border-strong`, `ink`, `ink-muted`, `ring`, `radius-0/sm/bs/lg/full`, `text-sm/md/lg`.

## Keyboard

| Key | Action |
| --- | --- |
| Enter, Space | Activate while focused |

## GPUI notes

- The focus ring is a border colour change, since GPUI has no outline or shadow.
- Disabled buttons drop their hover rule rather than overriding it, because a `:hover` rule outranks a plain class.
