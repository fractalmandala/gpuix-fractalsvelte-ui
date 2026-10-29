---
title: Kbd
description: Keyboard shortcut caps for a chord such as cmd+k, drawn with macOS glyphs.
category: feedback
---

`Kbd` displays a shortcut. It is display only: it does not bind the key. Wire the shortcut with `on_window_key` yourself.

```svelte
<script>
  import Kbd from 'gpuix-fractalsvelte-ui/Kbd.svelte';
</script>

<Kbd keys="cmd+k" />
<Kbd keys="shift+enter" size="h-sm" />
```

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `keys` | `string` | `''` | A chord such as `cmd+k` or `shift+enter`; each part becomes one cap. |
| `size` | `'h-sm' \| 'h-md'` | `'h-md'` | Fractalstyler's height steps. |
| `style` | `string \| null` | — |   |
| `testid` | `string \| null` | — |   |
## Tokens

`bg-raised`, `border-strong`, `height-md`, `radius-sm`, `text-secondary`
## Examples

Every variant, size and state, exactly as the gallery's Demo view renders them.

```svelte
<script lang="ts">
	import Kbd from 'gpuix-fractalsvelte-ui/Kbd.svelte';
	const SHORTCUTS = [
		['Command palette', 'cmd+k'],
		['Save', 'cmd+s'],
		['Find in page', 'cmd+shift+f'],
		['Send message', 'shift+enter'],
		['Close dialog', 'esc']
	];
</script>

<div style="display: flex; flex-direction: column; gap: 12px">
	{#each SHORTCUTS as [action, keys]}
		<div style="display: flex; flex-direction: row; gap: 16px; align-items: center; justify-content: space-between">
			<div style="color: var(--text-secondary)">{action}</div>
			<Kbd {keys} />
		</div>
	{/each}
	<div style="display: flex; flex-direction: row; gap: 16px; align-items: center">
		<Kbd keys="cmd+k" size="h-sm" />
		<Kbd keys="up" size="h-sm" />
		<Kbd keys="down" size="h-sm" />
	</div>
</div>
```

## GPUI notes

- Each cap has a 2px bottom border, which gives the key its raised look.
- `+` splits the chord, so the literal `+` key cannot be shown.
