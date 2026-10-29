---
title: Toast
description: Stacked notifications shown bottom-right, raised with the toast() function and dismissed by timer or close button.
category: overlays
---

`Toast` renders the notification stack for the `toast()` queue. Mount one `Toast` once in the app, then call `toast()` from anywhere. The queue is module-level state, so every call shows in that one stack.

```svelte
<script>
  import Toast from 'gpuix-fractalsvelte-ui/Toast.svelte';
  import Button from 'gpuix-fractalsvelte-ui/Button.svelte';
  import { toast } from 'gpuix-fractalsvelte-ui/toast.svelte.ts';
</script>

<Button label="Save" onclick={() => toast('Project saved', { title: 'Saved', tone: 'success' })} />
<Button label="Upload" tone="danger" onclick={() => toast('Upload failed', { tone: 'danger', duration: 0 })} />

<Toast />
```

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `style` | `string \| null` | `null` | Inline CSS on the stack, which sits bottom-right by default. |
| `testid` | `string \| null` | `null` | Test id on the stack. Each toast gets `${testid}-${id}` and its close button `${testid}-close-${id}`. |

## toast()

`toast(message, options)` adds a toast and returns its numeric id. `dismiss(id)` removes one early. Both come from `gpuix-fractalsvelte-ui/toast.svelte.ts`, not `Toast.svelte`.

| Argument / option | Type | Default | Notes |
| --- | --- | --- | --- |
| `message` | `string` | — | Required. Body text. |
| `title` | `string` | `''` | Bold line above the message. Omitted when empty. |
| `tone` | `'accent' \| 'neutral' \| 'success' \| 'warn' \| 'danger'` | `'neutral'` | Colour of the left bar. |
| `duration` | `number` | `4000` | Milliseconds until it dismisses itself. `0` keeps it until closed. |

`dismiss(id: number)` clears the toast's timer and removes it. Closing a toast from its ✕ button does the same.

`toasts` is the reactive array behind the stack, exported from the same module if you need to read the queue.

## Tokens

`overlay`, `ink`, `ink-muted`, `border`, `border-strong`, `raised`, `radius-sm`, `radius-md`, `text-sm`, `text-md`, `accent`, `success`, `warn`, `danger`.

## Keyboard

None. The ✕ button is a pointer target only.

## GPUI notes

- The stack is 320px wide and sits 16px from the bottom-right corner of the window. It renders through `Portal`, so placement in the tree does not matter.
- Toasts fade in over 0.2s on mount. There is no fade-out, so a dismissed toast disappears at once.
- Timers run in the JavaScript side. A `duration: 0` toast will sit in the stack until its ✕ is pressed or `dismiss` is called.
