---
title: Theming
description: ThemeProvider, the token contract, built-in themes and how to make your own.
---

Every component reads its colours, radii, fonts and type sizes from CSS variables named `--ui-<token>`. `ThemeProvider` sets them all with one `set_css_vars` call, so switching theme restyles the whole app in a single frame and recompiles nothing.

```svelte
<script>
  import { ThemeProvider, themes } from 'gpuix-fractalsvelte-ui';
  let dark = $state(false);
</script>

<ThemeProvider theme={dark ? themes.dark : themes.light}>
  <App />
</ThemeProvider>
```

Place one `ThemeProvider` at the root. It fills its parent, paints `bg`, and sets `ink`, `font` and `text-md` as the inherited text style. Components use the variables without fallbacks, so without a provider their colours are dropped and the renderer warns once per variable.

## Built-in themes

| Theme | Mode | Character |
| --- | --- | --- |
| `light` | light | Neutral greys, indigo accent |
| `dark` | dark | The same roles for dark surfaces |
| `mandala` | light | Warm paper, terracotta accent |
| `midnight` | dark | Navy, teal accent |

All four share one radius scale: `radius-0` 0, `radius-sm` 4, `radius-md` 6, `radius-bs` 8, `radius-lg` 11, `radius-full` 9999 px. Override any of them per theme.

## Your own theme

```ts
import { create_theme, themes } from 'gpuix-fractalsvelte-ui/theme';

export const forest = create_theme('forest', themes.dark, {
  accent: '#3fb27f',
  'accent-hover': '#5cc795',
  'accent-soft': '#173a2b',
  'radius-md': '8px'
});
```

For one-off tweaks, skip the new theme and pass `tokens` to the provider: `<ThemeProvider theme={themes.light} tokens={{ accent: '#e5484d' }}>`.

## Tokens

| Group | Tokens |
| --- | --- |
| Surfaces | `bg` (window), `surface` (cards, panels), `raised` (wells, hover fills), `overlay` (dialogs, menus), `scrim` (behind modals) |
| Text | `ink`, `ink-muted`, `ink-faint` |
| Lines | `border`, `border-strong`, `ring` (focus) |
| Tones | `accent`, `accent-hover`, `accent-ink`, `accent-soft`; `danger`, `danger-hover`, `danger-ink`, `danger-soft`; `success`, `success-ink`, `success-soft`; `warn`, `warn-ink`, `warn-soft` |
| Shape | `radius-0`, `radius-sm`, `radius-md`, `radius-bs`, `radius-lg`, `radius-full` |
| Type | `font`, `font-mono`, `text-xs`, `text-sm`, `text-md`, `text-lg`, `text-xl`, `text-2xl` |

`*-ink` is the text colour on a solid fill of that tone; `*-soft` is a tinted background for soft variants. The full list with types is `Tokens` in `src/theme/tokens.ts`.

The provider also feeds the base package's `Scroller` (`--scroller-thumb`, `--scroller-thumb-hover`) from `ink-faint` and `ink-muted`, so scrollbars follow the theme.

## Shapes

`Button`'s `shape` prop maps directly onto the radius scale, so changing a theme's radii also restyles every button shape:

| `shape` | Token | Default |
| --- | --- | --- |
| `rect` | `radius-0` | 0 px |
| `min` (default) | `radius-sm` | 4 px |
| `modern` | `radius-bs` | 8 px |
| `curved` | `radius-lg` | 11 px |
| `round` | `radius-full` | pill |

Other components use `radius-sm` for small parts, `radius-md` for controls and `radius-lg` for surfaces (modals, cards, drawers, popovers).

## Your own components

Use the same variables in your own `<style>` blocks and they follow the theme too:

```svelte
<div class="panel">…</div>
<style>
  .panel { background-color: var(--ui-surface); border-color: var(--ui-border); border-radius: var(--ui-radius-lg); }
</style>
```
