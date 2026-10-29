---
title: Component conventions
description: The contract every gpuix-fractalsvelte-ui component follows. Read before writing one.
---

This library runs Svelte 5 inside GPUI (no DOM, no browser CSS). Reference implementations: `src/components/Button.svelte` (action) and `src/components/Modal.svelte` (overlay). Copy their shape.

## Must read first

- `../gpuix-fractalsvelte/docs/package/02styling.md`: the CSS subset. Anything not listed is dropped.
- `../gpuix-fractalsvelte/docs/package/03components.md`: `Scroller`, `Portal`, `Tooltip`, `Popover`, `<anchored>`. Build on them; never re-implement.
- `../gpuix-fractalsvelte/docs/package/04guide.md`: inputs (`<input>`, `<textarea>`, no `bind:`; values arrive as `e.value`), focus, `on_window_key`.
- `../gpuix-fractalsvelte/docs/package/06testing.md`: headless test helpers.

## Hard rules (GPUI)

- Selectors: classes only, compound allowed (`.btn.solid.accent`), plus `:hover` / `:active`. No descendant/child combinators, no `:focus`, no attribute selectors, no `@media`, no nesting. Style each element with its own class.
- No `box-shadow`, `transform`, `transition`, `z-index`, gradients, `em`/`vh`, `flex: 1` (use `flex-grow: 1`), `border: 1px solid` (use `border-width` + `border-color`), `margin: auto`, `display: none` (use `{#if}`).
- `line-height` needs a unit. `%` only on width/height/min/max.
- Only text properties inherit. Set `color` on the element holding the text or a text ancestor.
- Transparent is `#00000000`.
- Elements are `div` (and `text`, `input`, `textarea`, `img`, `svg` per docs). Test ids use the attribute `testId={testid}`.
- An element with its own `onclick` blocks clicks from reaching ancestors (that is how dialogs stop scrim clicks).
- Focus: no `:focus`. Track `onfocus`/`onblur` into `class:focused` and draw the ring with `border-color: var(--ui-ring)`. Focusable elements need `tabindex={0}`; keyboard via `onkeydown` (`e.key` is lowercase: `enter`, `space`, `escape`, `up`, `down`, `left`, `right`, `tab`).
- Disabled state: gate hover rules behind an `.on` class (`.x.on:hover`) instead of trying to override them.

## Theming

- Colours, radii, fonts and type sizes come ONLY from `var(--ui-<token>)`; the token list is `src/theme/tokens.ts`. Never hard-code a colour except `#00000000`. Do not add tokens without being asked.
- Components assume a `ThemeProvider` ancestor and use vars without fallbacks.

## Props (shared vocabulary)

- `size?: 'sm' | 'md' | 'lg'` (default `md`; control heights 26 / 32 / 40), `tone?: Tone`, `variant?` where it makes sense. Types from `src/types.ts`.
- `shape?: 'rect' | 'min' | 'modern' | 'curved' | 'round' ` shapes the border-radius for buttons, inputs and other components.
- Always `style?: string | null` (inline, on the root or main box) and `testid?: string | null` (root; parts get `${testid}-part`).
- Controlled values: `value` + `onchange(value)` (call it with the new value, not the event). Open state: `open` + `onclose` / `onopenchange`. No `bind:` and no `$bindable`.
- Content: `children` snippet, plus a `label`/`title` string shorthand where natural.
- Svelte 5 runes only: `$props`, `$state`, `$derived`, `$effect`. TypeScript props type inline, one-line `/** */` doc on non-obvious props. No other comments unless the WHY is non-obvious.

## Each component ships three things

1. `src/components/<Name>.svelte`
2. `docs/components/<name>.md`: copy the structure of `docs/components/button.md` exactly (YAML frontmatter with title, description, category; no H1; usage, Props table, Tokens, Keyboard, GPUI notes).
3. `tests/<Name>.harness.svelte` (wrap in `ThemeProvider`) + `tests/<Name>.test.ts` with real interactions and `finish('<Name>', n)`. Run: `npx gpuix-fractalsvelte tests/<Name>.test.ts`. Keep harness layouts under 500px tall. Take a `screenshot('/tmp/gpuix-ui-<name>.png')` and look at it.

Then add the export line to `src/index.ts`. A component is done only when its test prints `<Name> ok` with zero warnings in the output.
