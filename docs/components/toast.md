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

<Button label="Save" onclick={() => toast('Project saved', { title: 'Saved', variant: 'success' })} />
<Button label="Upload" variant="danger" onclick={() => toast('Upload failed', { variant: 'danger', duration: 0 })} />

<Toast />
```

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `style` | `string \| null` | — | Inline CSS for the stack, which sits bottom-right by default. |
| `testid` | `string \| null` | — |   |
## toast()

`toast(message, options)` adds a toast and returns its numeric id. `dismiss(id)` removes one early. Both come from `gpuix-fractalsvelte-ui/toast.svelte.ts`, not `Toast.svelte`.

| Argument / option | Type | Default | Notes |
| --- | --- | --- | --- |
| `message` | `string` | — | Required. Body text. |
| `title` | `string` | `''` | Bold line above the message. Omitted when empty. |
| `variant` | `'secondary' \| 'themed' \| 'info' \| 'success' \| 'warning' \| 'danger'` | `'secondary'` | Colour of the left bar. |
| `duration` | `number` | `4000` | Milliseconds until it dismisses itself. `0` keeps it until closed. |

`dismiss(id: number)` clears the toast's timer and removes it. Closing a toast from its ✕ button does the same.

`toasts` is the reactive array behind the stack, exported from the same module if you need to read the queue.

## Tokens

`bg-raised`, `bg-sunken`, `border`, `border-strong`, `danger`, `info`, `radius-md`, `radius-sm`, `success`, `text-md`, `text-primary`, `text-secondary`, `text-sm`, `theme-color`, `warning`
## Keyboard

None. The ✕ button is a pointer target only.

## Examples

Every variant, size and state, exactly as the gallery's Demo view renders them.

```svelte
<script lang="ts">
	import Button from 'gpuix-fractalsvelte-ui/Button.svelte';
	import Toast from 'gpuix-fractalsvelte-ui/Toast.svelte';
	import { toast, toasts, dismiss } from 'gpuix-fractalsvelte-ui/toast.svelte.ts';
</script>

<div style="display: flex; flex-direction: column; gap: 16px">
	<div style="display: flex; flex-direction: row; gap: 8px; align-items: center">
		<Button label="Accent" variant="themed" onclick={() => toast('A new version is ready to install.', { title: 'Update', variant: 'themed' })} />
		<Button label="Neutral" variant="secondary" onclick={() => toast('Changes are saved to this device.', { title: 'Saved' })} />
		<Button label="Success" variant="success" onclick={() => toast('Your export finished in 4 seconds.', { title: 'Export complete', variant: 'success' })} />
		<Button label="Warn" variant="warning" onclick={() => toast('Storage is 90% full.', { title: 'Heads up', variant: 'warning' })} />
		<Button label="Danger" variant="danger" onclick={() => toast('The upload stopped. Check your connection.', { title: 'Upload failed', variant: 'danger', duration: 0 })} />
	</div>
	<div style="display: flex; flex-direction: row; gap: 8px; align-items: center">
		<Button label="Clear all" variant="ghost" size="h-md" onclick={() => toasts.forEach((t) => dismiss(t.id))} />
		<div style="font-size: var(--text-sm); color: var(--text-secondary)">{toasts.length} showing · the danger toast stays until closed</div>
	</div>
	<Toast />
</div>
```

## GPUI notes

- The stack is 320px wide and sits 16px from the bottom-right corner of the window. It renders through `Portal`, so placement in the tree does not matter.
- Toasts fade in over 0.2s on mount. There is no fade-out, so a dismissed toast disappears at once.
- Timers run in the JavaScript side. A `duration: 0` toast will sit in the stack until its ✕ is pressed or `dismiss` is called.
