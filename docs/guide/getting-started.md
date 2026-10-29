---
title: Getting started
description: Install gpuix-fractalsvelte-ui, start an app, and render your first component in a native window.
---

gpuix-fractalsvelte-ui is not on npm yet. You install it from its folder on disk, next to the base package it builds on. The steps below are the ones tested end to end.

## What you need

- macOS (the GPU backend is Metal; Windows uses DirectX). Node 24 or newer, or Bun 1.4 or newer.
- The `gpuix-fractalsvelte` repository, which holds the base renderer and its starter.
- This repository, `gpuix-fractalsvelte-ui`, checked out beside it.

## 1. Create an app

Run these from the folder that holds both repositories. It is the one that contains `gpuix-fractalsvelte` and `gpuix-fractalsvelte-ui`. The starter is a counter in a native window.

```sh
cp -R ../gpuix-fractalsvelte/starter my-app
cd my-app
npm install
npm start
```

A window opens. Edit `App.svelte` and save: the window hot-reloads.

## 2. Add the component library

From `my-app`, point a dependency at the library folder. The path is relative to `my-app`, so it is `../gpuix-fractalsvelte-ui` when `my-app` sits next to both repositories:

```sh
npm install file:../gpuix-fractalsvelte-ui
```

This is the same mechanism the starter uses for the base package, so the library and your app share one `svelte` build.

## 3. Render a component

Replace `App.svelte` with this:

```svelte
<script lang="ts">
  import { ThemeProvider, Button, themes } from 'gpuix-fractalsvelte-ui';

  let count = $state(0);
</script>

<ThemeProvider theme={themes.dark}>
  <div style="padding: 24px">
    <Button label="Clicked {count} times" onclick={() => count++} />
  </div>
</ThemeProvider>
```

Save. You should see a dark window with one button. Click it and the count changes.

Three things to notice:

- `ThemeProvider` goes once, at the root. It sets the colours and the light or dark mode for everything inside it.
- `Button` and `ThemeProvider` both come from `gpuix-fractalsvelte-ui`. Every component is exported from that one name.
- `onclick` receives the click event, and `label` is plain text. Use `children` instead of `label` when the content needs markup.

## 4. Check it works

The starter includes a headless test. Add one line to `test.ts` to click the button and check the result:

```ts
import 'gpuix-fractalsvelte';
import { mount_headless, click_text, find_text, check, finish } from 'gpuix-fractalsvelte/test';
import App from './App.svelte';

mount_headless(App, { width: 400, height: 200 });
click_text('Clicked 0 times');
check('the button counts clicks', !!find_text('Clicked 1 times'));
finish('app', 1);
```

Run it with `npm test`. It needs no window, and it uses the same GPU pipeline as the real app.

## Next

- [Understanding gpuix-svelte](./understanding-gpuix-svelte.md): what the renderer is and what it can and cannot draw.
- [Using components](./using-components.md): imports, props, and the patterns every component shares.
- [Theming](../theming.md): colours, the light and dark modes, and the built-in themes.
- [Component reference](../components/): one page per component, with its props, tokens and full examples.
