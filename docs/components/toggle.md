---
title: Toggle
description: Button that holds a pressed or unpressed state, with a tone for the pressed look.
category: actions
---

`Toggle` is a button with two states. It is controlled, so the parent owns `pressed` and updates it in `onchange`.

```svelte
<script>
  import Toggle from 'gpuix-fractalsvelte-ui/Toggle.svelte';
  let bold = $state(false);
</script>

<Toggle label="Bold" pressed={bold} onchange={(p) => (bold = p)} />
<Toggle variant="ghost" tone="success" label="Wrap" pressed={wrap} onchange={(p) => (wrap = p)} />
<Toggle label="Locked" disabled pressed />
```

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `pressed` | `boolean` | `false` | Whether the toggle is on. |
| `onchange` | `(pressed: boolean) => void` | — | Called with the next state. |
| `label` | `string` | `''` | Plain-text content. Ignored when `children` is given. |
| `children` | `Snippet` | — | Rich content. |
| `variant` | `'outline' \| 'ghost'` | `'outline'` | Unpressed chrome: outlined or bare. |
| `tone` | `'accent' \| 'neutral' \| 'success' \| 'warn' \| 'danger'` | `'accent'` | Colour of the pressed state. |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Heights 26 / 32 / 40 px. |
| `disabled` | `boolean` | `false` | Dims, leaves the tab order, ignores clicks. |
| `style` | `string` | — | Inline CSS; wins over the component's rules. |
| `testid` | `string` | — | Test id on the root. |

## Tokens

`accent`, `accent-soft`, the same for `success`, `warn` and `danger`, `raised`, `border-strong`, `ink`, `ink-muted`, `ring`, `radius-sm/md/lg`, `text-sm/md/lg`.

## Keyboard

| Key | Action |
| --- | --- |
| Enter, Space | Flip the state while focused |

## GPUI notes

- The pressed state changes the fill and text colour only, so the focus ring on the border still shows on a pressed toggle.
- Disabled toggles drop their hover rule rather than overriding it.
