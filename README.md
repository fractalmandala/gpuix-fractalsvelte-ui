# gpuix-fractalsvelte-ui

Components for Svelte 5 apps that render natively through GPUI with [gpuix-fractalsvelte](../gpuix-fractalsvelte). No DOM and no webview: every component compiles to GPUI elements, follows GPUI's CSS subset, and is tested headlessly through the real GPU pipeline.

- 37 components across actions, inputs, layout, navigation, overlays and feedback
- Theming through CSS variables: 4 built-in themes, your own in a few lines, switched at runtime in one frame
- A shared prop vocabulary: `size`, `tone`, `variant`, `style`, `testid`, and controlled `value` + `onchange`
- Keyboard support and focus rings on every interactive component
- One doc page and one headless test per component

## Install

```sh
npm install gpuix-fractalsvelte-ui
```

The app must run on `gpuix-fractalsvelte` (start one with `npm create gpuix-fractalsvelte`).

## Use

```svelte
<script>
  import { ThemeProvider, Button, Modal, themes } from 'gpuix-fractalsvelte-ui';
  let open = $state(false);
</script>

<ThemeProvider theme={themes.dark}>
  <Button label="Delete" tone="danger" onclick={() => (open = true)} />
  <Modal {open} onclose={() => (open = false)} title="Delete file?">
    This cannot be undone.
  </Modal>
</ThemeProvider>
```

You can also import components one at a time: `import Button from 'gpuix-fractalsvelte-ui/Button.svelte'`.

Read [Theming](docs/theming.md) for tokens and custom themes.

## Components

### Actions

| Component | What it does |
| --- | --- |
| [Button](docs/components/button.md) | Clickable action with variants, tones, sizes, loading and icon slots. |
| [ButtonGroup](docs/components/buttongroup.md) | Row of attached buttons, or a segmented single-select control driven by options and value. |
| [IconButton](docs/components/iconbutton.md) | Square icon-only action with a hover tooltip, sharing Button's variants, tones and sizes. |
| [Link](docs/components/link.md) | Inline text action with tones, underlined on hover. |
| [Toggle](docs/components/toggle.md) | Button that holds a pressed or unpressed state, with a tone for the pressed look. |

### Inputs

| Component | What it does |
| --- | --- |
| [Checkbox](docs/components/checkbox.md) | Boolean or indeterminate check with a label, in three sizes, controlled by the parent. |
| [RadioGroup](docs/components/radiogroup.md) | Pick one of a few options, in a column or a row, with arrow-key navigation. |
| [Select](docs/components/select.md) | Dropdown that picks one option from a list, with keyboard navigation and a scrolling list for long option sets. |
| [Slider](docs/components/slider.md) | Pick a number in a range by dragging the thumb, clicking the track or using the arrow keys. |
| [Switch](docs/components/switch.md) | On/off toggle with a track and thumb, optional label, and three sizes. |
| [TextArea](docs/components/textarea.md) | Multi-line text field with label, hint or error text, and a height that grows with its content. |
| [TextInput](docs/components/textinput.md) | Single-line text field with label, hint or error text, leading and trailing slots, and three sizes. |

### Layout

| Component | What it does |
| --- | --- |
| [Box](docs/components/box.md) | Plain flex column with optional padding, background, border and corner radius. |
| [Card](docs/components/card.md) | Surface with a header, body and footer, optionally clickable as a whole. |
| [Divider](docs/components/divider.md) | Hairline rule, horizontal or vertical, with an optional centred label. |
| [Grid](docs/components/grid.md) | Equal-width column grid with a spacing gap between cells. |
| [ScrollArea](docs/components/scrollarea.md) | Vertically scrolling column with a fixed height or a height cap, and a drawn scroll thumb. |
| [Spacer](docs/components/spacer.md) | Flexible empty box that takes up the free space in a row or column. |
| [SplitPane](docs/components/splitpane.md) | Two panes divided by a draggable, keyboard-nudgeable grip, side by side or stacked. |
| [Stack](docs/components/stack.md) | Flex row or column with spacing, alignment, justification and optional wrapping. |

### Navigation

| Component | What it does |
| --- | --- |
| [Breadcrumbs](docs/components/breadcrumbs.md) | Trail of ancestor pages, with the last item marked as the current page. |
| [Menu](docs/components/menu.md) | Dropdown of actions anchored to a trigger, with shortcuts, tones, disabled items and separators. |
| [NavList](docs/components/navlist.md) | Vertical sidebar list with section headings, optional icons and badges. |
| [Pagination](docs/components/pagination.md) | Page controls with previous and next buttons and a windowed run of page numbers around the current page. |
| [Tabs](docs/components/tabs.md) | Switch between sibling views with an underline or a segmented pill control. |

### Overlays

| Component | What it does |
| --- | --- |
| [ContextMenu](docs/components/contextmenu.md) | Wraps a region and opens a menu of actions on right click or ctrl+click. |
| [Drawer](docs/components/drawer.md) | Panel that slides in from the left, right or bottom over a scrim, with title, body and footer. |
| [Modal](docs/components/modal.md) | Centred dialog over a scrim, with title, body and footer actions. |
| [Popover](docs/components/popover.md) | Floating panel anchored to a trigger, or to window coordinates, that closes on outside press or Escape. |
| [Toast](docs/components/toast.md) | Stacked notifications shown bottom-right, raised with the toast() function and dismissed by timer or close button. |
| [Tooltip](docs/components/tooltip.md) | Short hover hint beside a trigger, shown after a delay and hidden when the pointer leaves. |

### Feedback

| Component | What it does |
| --- | --- |
| [Alert](docs/components/alert.md) | Inline status message with a tone, optional title and a dismiss control. |
| [Avatar](docs/components/avatar.md) | Circle or square user image, falling back to initials from a name. |
| [Badge](docs/components/badge.md) | Small pill label for counts, statuses and tags, in five tones and three variants. |
| [Kbd](docs/components/kbd.md) | Keyboard shortcut caps for a chord such as cmd+k, drawn with macOS glyphs. |
| [Progress](docs/components/progress.md) | Horizontal progress bar for a known percentage, or an indeterminate sweep. |
| [Spinner](docs/components/spinner.md) | Indeterminate loading indicator drawn as a ring of fading dots. |

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