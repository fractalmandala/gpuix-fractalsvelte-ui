---
title: Kbd
description: Keyboard shortcut caps for a chord such as cmd+k, drawn with macOS glyphs.
category: feedback
---

`Kbd` displays a shortcut. It is display only: it does not bind the key. Wire the shortcut with `on_window_key` yourself.

```svelte
<script>
  import Kbd from 'gpuix-fractalsvelte-ui/Kbd.svelte';
</script>

<Kbd keys="cmd+k" />
<Kbd keys="shift+enter" size="sm" />
```

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `keys` | `string` | — | A chord joined by `+`, e.g. `cmd+k`. Each part becomes one cap. Known names map to glyphs (`cmd` → ⌘, `shift` → ⇧, `enter` → ↵, `esc` → ⎋, `space` → Space, and so on); others are upper-cased. |
| `size` | `'sm' \| 'md'` | `'md'` | Caps 18 / 22 px high. |
| `style` | `string \| null` | `null` | Inline CSS on the root. |
| `testid` | `string \| null` | `null` | Test id on the root. |

## Tokens

`border-strong`, `raised`, `radius-sm`, `ink-muted`, `text-xs`, `text-sm`.

## GPUI notes

- Each cap has a 2px bottom border, which gives the key its raised look.
- `+` splits the chord, so the literal `+` key cannot be shown.
