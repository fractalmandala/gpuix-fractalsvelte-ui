---
title: Toggle
description: Button that holds a pressed or unpressed state, with a `pressedVariant` for the pressed look.
category: actions
---

`Toggle` is a button with two states. It is controlled, so the parent owns `pressed` and updates it in `onchange`.

```svelte
<script>
  import Toggle from 'gpuix-fractalsvelte-ui/Toggle.svelte';
  let bold = $state(false);
</script>

<Toggle label="Bold" pressed={bold} onchange={(p) => (bold = p)} />
<Toggle pressedVariant="success" label="Wrap" pressed={wrap} onchange={(p) => (wrap = p)} />
<Toggle label="Locked" disabled pressed />
```

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `children` | `Snippet` | — |   |
| `label` | `string` | `''` |   |
| `pressed` | `boolean` | `false` | Whether the toggle is on. Pair with `onchange`. |
| `onchange` | `(pressed: boolean) => void` | — | Called with the next pressed state. |
| `variant` | `'outline' \| 'ghost'` | `'outline'` |   |
| `pressedVariant` | `'themed' \| 'secondary' \| 'info' \| 'success' \| 'warning' \| 'danger'` | `'themed'` | Colour of the pressed state, in fractalstyler's names. |
| `size` | `'h-sm' \| 'h-md' \| 'h-bs' \| 'h-lg' \| 'h-xl'` | `'h-bs'` | Fractalstyler's height steps. |
| `disabled` | `boolean` | `false` |   |
| `style` | `string \| null` | — |   |
| `testid` | `string \| null` | — |   |
## Tokens

`bg-raised`, `border-strong`, `danger`, `danger-soft`, `info`, `info-soft`, `radius-md`, `ring`, `success`, `success-soft`, `text-primary`, `text-secondary`, `theme-color`, `theme-color-sub`, `warning`, `warning-soft`
## Keyboard

| Key | Action |
| --- | --- |
| Enter, Space | Flip the state while focused |

## Examples

Every variant, size and state, exactly as the gallery's Demo view renders them.

```svelte
<script lang="ts">
	import Toggle from 'gpuix-fractalsvelte-ui/Toggle.svelte';
	let bold = $state(false);
	let italic = $state(true);
	let wrap = $state(false);
</script>

<div style="display: flex; flex-direction: column; gap: 12px">
	<div style="display: flex; flex-direction: row; gap: 8px; align-items: center">
		<Toggle label="Bold" pressed={bold} onchange={(p) => (bold = p)} />
		<Toggle label="Italic" pressed={italic} onchange={(p) => (italic = p)} pressedVariant="secondary" />
		<Toggle label="Wrap" pressed={wrap} onchange={(p) => (wrap = p)} pressedVariant="success" variant="ghost" />
		<Toggle label="Locked" pressed disabled pressedVariant="danger" />
	</div>
	<div style="display: flex; flex-direction: row; gap: 8px; align-items: center">
		{#each ['themed', 'secondary', 'info', 'success', 'warning', 'danger'] as const as pressedVariant}
			<Toggle pressedVariant={pressedVariant} label={pressedVariant} pressed={pressedVariant !== 'secondary'} />
		{/each}
	</div>
	<div style="display: flex; flex-direction: row; gap: 8px; align-items: center">
		<Toggle size="h-md" label="Small" pressed />
		<Toggle size="h-bs" label="Medium" pressed />
		<Toggle size="h-lg" label="Large" pressed />
	</div>
	<div style="color: var(--text-secondary)">bold: {bold ? 'on' : 'off'} · italic: {italic ? 'on' : 'off'} · wrap: {wrap ? 'on' : 'off'}</div>
</div>
```

## GPUI notes

- The pressed state changes the fill and text colour only, so the focus ring on the border still shows on a pressed toggle.
- Disabled toggles drop their hover rule rather than overriding it.
