---
title: Using components
description: How to import a component, the props every component shares, and how to hold state and handle events.
---

## Importing

Every component is exported from the package root:

```svelte
<script lang="ts">
  import { Button, TextInput, Modal, ThemeProvider, themes } from 'gpuix-fractalsvelte-ui';
</script>
```

You can also import one file directly. This is handy when you want to keep the import list short:

```svelte
<script lang="ts">
  import Button from 'gpuix-fractalsvelte-ui/Button.svelte';
</script>
```

Both forms give you the same component.

## Props every component shares

Most components follow the same few conventions, so once you know one you know the rest.

| Prop | What it does |
| --- | --- |
| `variant` | The visual role, using Fractalstyler's names: `primary`, `secondary`, `themed`, `outline`, `ghost`, `link`, `info`, `success`, `warning`, `danger`. Controls and alerts use it. |
| `size` | For controls, a height step: `h-sm`, `h-md`, `h-bs`, `h-lg`, `h-xl`. For text, `sm`, `md` or `lg`. Each component's page says which. |
| `style` | Extra inline CSS for the component's root, for example `style="width: 240px"`. It wins over the component's own styling. |
| `testid` | A name for the root element. Tests use it to find the element, and it does not change how the component looks. |

A component's own page lists every prop, with its type and default. Its Examples section shows each variant and size in use.

## Holding state

Components do not keep their own value when the value matters to your app. You hold it, and the component reports changes through a callback.

```svelte
<script lang="ts">
  import { TextInput, Checkbox } from 'gpuix-fractalsvelte-ui';

  let name = $state('');
  let agree = $state(false);
</script>

<TextInput value={name} onchange={(v) => (name = v)} placeholder="Your name" />
<Checkbox checked={agree} onchange={(v) => (agree = v)} label="I agree" />
```

The pattern is the same across the library:

- `value` or `checked` is what the component shows.
- `onchange` is called with the new value. It is not a DOM event.
- `open` and `onclose` control overlays such as `Modal`, `Drawer` and `Popover`. The component asks to close; you decide.

## Content

Use `label` for plain text. Use a snippet, written as `{#snippet children()}…{/snippet}`, for anything with structure.

```svelte
<Button variant="outline">
  {#snippet children()}Save <text style="font-weight: 700">draft</text>{/snippet}
</Button>
```

Components that take extra regions name them in the same way: `footer`, `actions`, `trigger`, `content`, `leading`, `trailing`.

## Events

- Click handlers receive the event. Use `onclick={() => …}` when you don't need it.
- Keyboard use is built in. Focusable controls respond to Enter and Space, and the other controls listed on their page respond to the arrow keys.

## Overlays

Overlays are closed by default. Open one by setting its state:

```svelte
<script lang="ts">
  import { Button, Modal } from 'gpuix-fractalsvelte-ui';
  let open = $state(false);
</script>

<Button label="Delete" variant="danger" onclick={() => (open = true)} />
<Modal {open} onclose={() => (open = false)} title="Delete this file?">
  This cannot be undone.
  {#snippet footer()}
    <Button label="Cancel" variant="ghost" onclick={() => (open = false)} />
    <Button label="Delete" variant="danger" onclick={remove} />
  {/snippet}
</Modal>
```

`Popover` works the same way, with a trigger and a `content` snippet. See its page for the full example, including placing the panel at the pointer.

## Theming

Components read their colours from the active theme, so you do not style them one by one. Wrap your app in a `ThemeProvider` and pick a theme. See [Theming](../theming.md).

## Where to go next

- [Component reference](../components/): one page per component.
- [Theming](../theming.md): the colour tokens and how to make your own theme.
- [Getting started](./getting-started.md): if you have not set up an app yet.
