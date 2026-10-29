---
title: Avatar
description: Circle or square user image, falling back to initials from a name.
category: feedback
---

`Avatar` shows a picture when `src` is set, and otherwise the initials of `name` on a tinted background.

```svelte
<script>
  import Avatar from 'gpuix-fractalsvelte-ui/Avatar.svelte';
</script>

<Avatar name="Ada Lovelace" />
<Avatar name="Grace Hopper" size="lg" shape="square" />
<Avatar name="Linus" src="/avatars/linus.png" size="sm" />
```

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `name` | `string` | `''` | Initials come from the first and last word; one word gives its first letter. Used as `alt` for the image. |
| `src` | `string \| null` | `null` | Image path or URL. Initials show while it is unset. |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Diameters 24 / 32 / 40 px. |
| `shape` | `'circle' \| 'square'` | `'circle'` | Full radius or `radius-md`. |
| `style` | `string \| null` | `null` | Inline CSS on the root. |
| `testid` | `string \| null` | `null` | Test id on the root; the image gets `${testid}-img`. |

## Tokens

`accent`, `accent-soft`, `radius-md`, `radius-full`, `text-xs`, `text-sm`, `text-md`.

## GPUI notes

- The image is drawn with `objectfit="cover"` inside a root that sets `overflow: hidden`, so it is clipped to the circle or square.
- When `src` is set the initials are not rendered, and the component has no fallback if the image fails to load.
