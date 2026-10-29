---
title: Understanding gpuix-svelte
description: What gpuix-svelte is, how Svelte draws into a native GPUI window, and what that means for the components.
---

## The short version

You write Svelte components. They do not render to a browser. They render to [GPUI](https://www.gpui.rs/), the GPU-accelerated UI framework behind the Zed editor, and appear in a native window.

- **gpuix-svelte** is the Svelte renderer. Svelte compiles your components to calls that create GPUI elements. The package in this repository is a fork called `gpuix-fractalsvelte`, which adds its own styling system.
- **@gpuix/native** is the bridge to GPUI, written in Rust and loaded as a native module.
- **gpuix-fractalsvelte-ui** (this library) is a set of components built on the renderer.

## What "no DOM" means

There is no HTML, no `document`, and no browser CSS engine. Anything you know from the web that depends on those does not exist here:

- No `querySelector`, no `addEventListener` on arbitrary nodes, no `window.getComputedStyle`.
- No browser fonts, scrollbars or form controls. GPUI paints its own. The library provides scrolling and form controls that GPUI does not give you.
- No `:focus`, `:focus-visible`, attribute selectors or media queries.

Elements are the GPUI elements, written as plain tags: `div`, `text`, `input`, `textarea`, `img`, `svg`, `canvas`, `code`, `diff`, `markdown`, `virtual-list`, and `anchored` for floating layers.

## Styling

Styling goes through a subset of CSS. The renderer translates what GPUI can draw and drops the rest.

What works:

- Flexbox layout: `display: flex`, `flex-direction`, `gap`, `align-items`, `justify-content`, `flex-grow`, `flex-wrap`, plus `display: grid`.
- Sizes and spacing in pixels or `rem`: `width`, `height`, `min-*`, `max-*`, `padding`, `margin`.
- Colours, borders, border radius, opacity, font size, weight and family, and text alignment.
- `var(--name)` values, set at runtime with `set_css_vars`. This is how themes work.
- Class rules in a `<style>` block, using classes and `:hover` / `:active`.

What does not:

- Shadows, transforms, transitions, and `z-index`. Depth comes from borders and surface colours.
- Descendant and child selectors, nesting, and `@media`.
- Only text properties inherit (colour, font, line height and similar). Set layout and background on the element itself.

The full list, with the reasoning, is in the base package's [styling guide](../../../gpuix-fractalsvelte/docs/package/02styling.md).

### Fractalstyler

The base package ships Fractalstyler, a set of utility classes and tokens (`box`, `row`, `gap-md`, `pad-lg`, `bg-surface`, `text-primary`, `radius-md`, and so on). It loads automatically, so you can use its classes in any app built on the renderer. The components in this library are built from those classes. See [Theming](../theming.md) for how the colour tokens fit in.

## Events and focus

- Click handlers are `onclick`, and keyboard handlers are `onkeydown`. Key names are lowercase: `enter`, `space`, `escape`, `up`, `down`, `left`, `right`, `tab`.
- An element receives keyboard events only when it has focus. Make it focusable with `tabindex={0}`.
- Window-wide shortcuts use `on_window_key` from `gpuix-fractalsvelte`.
- Text input reports changes through events, not `bind:`. A field passes its value as `e.value` in `onchange`.

## Floating layers

Overlays such as dialogs, menus and popovers are drawn on top of the page through a portal. `Modal`, `Drawer`, `Popover`, `Menu`, `Tooltip` and `ContextMenu` handle that for you. You control them with an `open` value and an `onclose` callback.

## Testing without a window

Tests mount a component headlessly and drive it with real input, through GPUI's own hit testing. A test clicks what a user would click and reads back the text and the layout. `testid` attributes give a test something stable to find. The library's own 39 suites run this way.

## Things to keep in mind

- The renderer is experimental, and it is built on an unreleased Svelte renderer API. Pin the versions you test against.
- Layout is computed by GPUI, not the browser, so a layout that works on the web can need adjusting. Check it in a window, not only in your head.
- The desktop build targets macOS first. Windows uses DirectX.
