# gpuix-fractalsvelte-ui

Components for Svelte 5 apps that render natively through GPUI, on top of [gpuix-fractalsvelte](../gpuix-fractalsvelte). No DOM and no webview: every component compiles to GPUI elements, uses GPUI's CSS subset, and is tested headlessly through the real GPU pipeline.

- 37 components across actions, inputs, layout, navigation, overlays and feedback
- Styling and colours from Fractalstyler: variants, sizes and tokens are the same names the rest of the stack uses
- Themes switched at runtime in one frame, with `ThemeProvider`
- A shared prop vocabulary: `variant`, `size`, `style`, `testid`, and controlled `value` + `onchange`
- A page per component with its props, tokens and full examples, plus a live gallery

## Documentation

- [Getting started](docs/guide/getting-started.md): install, run an app, render your first component
- [Understanding gpuix-svelte](docs/guide/understanding-gpuix-svelte.md): what the renderer is and what it can draw
- [Using components](docs/guide/using-components.md): imports, shared props, state and events
- [Theming](docs/theming.md): themes, tokens, and your own theme
- [Component reference](docs/components/): one page per component

## Install

The package is not on npm yet. Install it from its folder:

```sh
npm install file:../gpuix-fractalsvelte-ui
```

See [Getting started](docs/guide/getting-started.md) for the full set-up.

## Develop

```sh
bun install
bun run gallery         # every component, live, with a theme switcher (hot reloads)
bun run test            # every headless suite
bun run test Button     # suites whose file name matches
bun scripts/gen.ts      # regenerate src/index.ts and gallery/registry.ts after adding a component
bun run typecheck
```

New components follow [CONVENTIONS.md](CONVENTIONS.md): a component file, a doc page, a test with a harness, and a gallery demo.

## Known limits

- GPUI has no shadows, transforms or transitions, so elevation is shown with borders and surface colours, and focus with a border colour.

## License

[License](./LICENSE)