---
title: Theming
description: ThemeProvider, the built-in themes, the colour tokens they set, and how to make your own.
---

A theme is a set of values for named tokens. Components use only the token names, never the values, so the same component looks right in any theme, and a theme change restyles the whole app at runtime.

## Using a theme

Wrap the app once, at the root:

```svelte
<script lang="ts">
  import { ThemeProvider, themes } from 'gpuix-fractalsvelte-ui';
  let dark = $state(true);
</script>

<ThemeProvider theme={dark ? themes.dark : themes.light}>
  <!-- your app -->
</ThemeProvider>
```

`ThemeProvider` sets the light or dark mode of the base renderer from the theme's `dark` flag, and it sets every token. Switching themes is one state change.

## Built-in themes

| Theme | Mode | Character |
| --- | --- | --- |
| `light` | light | Neutral greys, indigo accent |
| `dark` | dark | The same roles for dark surfaces |
| `mandala` | light | Warm paper, terracotta accent, tighter corners |
| `midnight` | dark | Navy, teal accent, softer corners |

All four share the same type scale. Corner radii differ only in `mandala` and `midnight`.

## Tokens

Each theme sets these names. Components use them through the classes and `var(--name)` references.

| Group | Tokens | Used for |
| --- | --- | --- |
| Surfaces | `bg`, `bg-surface`, `bg-raised`, `bg-sunken`, `bg-extra` | The window, cards, hover fills, menus and dialogs, the dimming behind overlays |
| Text | `text-primary`, `text-secondary`, `text-muted`, `text-theme`, `text-inverse` | Main text, secondary text, faint text, text on accent fills, text on coloured fills |
| Lines | `border`, `border-strong`, `ring` | Dividers and outlines, stronger outlines, focus |
| Accent | `theme-color`, `theme-color-alt`, `theme-color-sub` | The main accent, its hover colour, and its soft tint |
| Status | `success`, `warning`, `danger`, `info`, each with `-hover` and `-soft` | Alerts, badges, toasts and the matching variants |
| Shape | `radius-0`, `radius-sm`, `radius-md`, `radius-bs`, `radius-lg`, `radius-full` | Corners, from square to pill |
| Type | `font-sans`, `font-mono`, `text-xs`, `text-sm`, `text-md`, `text-lg`, `text-xl`, `text-2xl` | Fonts and type sizes |

`font-sans` and `font-mono` hold one family name each — GPUI matches it exactly, so a CSS stack
like `"Google Sans", sans-serif` matches nothing and silently falls back. The package ships Google
Sans and Atkinson Hyperlegible Mono in `static/fonts`; `load_fonts()` registers them, and has to run
before the first layout:

```svelte
<script lang="ts">
	import { load_fonts } from 'gpuix-fractalsvelte-ui';
	load_fonts();
</script>
```

The faces are `.ttf`: `register_font` rejects `.woff2`.

## Your own theme

Start from a built-in theme and change what you need:

```ts
import { create_theme, themes } from 'gpuix-fractalsvelte-ui';

export const forest = create_theme('forest', themes.dark, {
  'theme-color': '#3fb27f',
  'theme-color-alt': '#5cc795',
  'theme-color-sub': '#173a2b',
  'radius-md': '8px'
});
```

The third argument is the set of tokens you change. The fourth, optional, sets the mode; by default it matches the base theme.

To change a few tokens for one screen without a new theme, pass them to the provider:

```svelte
<ThemeProvider theme={themes.light} tokens={{ 'theme-color': '#e5484d' }}>
  …
</ThemeProvider>
```

## Things a theme cannot change

- Fractalstyler's own radius and type scales are shared across the app, so a theme's `radius-*` and `text-*` values apply everywhere, not only to these components.
