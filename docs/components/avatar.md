---
title: Avatar
description: Circle or square user image, falling back to initials from a name.
category: feedback
---

`Avatar` shows a picture when `src` is set, and otherwise the initials of `name` on a tinted background.

```svelte
<script>
  import Avatar from 'gpuix-fractalsvelte-ui/Avatar.svelte';
</script>

<Avatar name="Ada Lovelace" />
<Avatar name="Grace Hopper" size="lg" shape="square" />
<Avatar name="Linus" src="/avatars/linus.png" size="sm" />
```

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `name` | `string` | `''` | Initials come from the first and last word. |
| `src` | `string \| null` | — | Image path or URL; the initials show while it is unset. |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` |   |
| `shape` | `'circle' \| 'square'` | `'circle'` |   |
| `style` | `string \| null` | — |   |
| `testid` | `string \| null` | — |   |
## Tokens

`theme-color`, `theme-color-sub`
## Examples

Every variant, size and state, exactly as the gallery's Demo view renders them.

```svelte
<script lang="ts">
	import Avatar from 'gpuix-fractalsvelte-ui/Avatar.svelte';
	const PEOPLE = ['Ada Lovelace', 'Grace Hopper', 'Alan Turing'];
</script>

<div style="display: flex; flex-direction: column; gap: 16px">
	<div style="display: flex; flex-direction: row; gap: 12px; align-items: center">
		<Avatar name="Ada Lovelace" size="sm" />
		<Avatar name="Ada Lovelace" />
		<Avatar name="Ada Lovelace" size="lg" />
		<Avatar name="Ada Lovelace" size="lg" shape="square" />
		<Avatar name="Grace Hopper" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAIAAABLbSncAAAAgElEQVR4nA3JIQFFMQhA0R/n1VgNGqAxa4CZXgMaoDGEwNwwf8ee3ycsQQQTjhBCCSP8PmUpophylFBKGX2xWRvZ2OZsYlOb2S+c5YhjznHCKWf8xWVd5GKXc4lLXea+CFYggQUniKCCiRfJSiSx5CSRVDL5olmNNNacJppqpvkDd6t6gRN3ZoUAAAAASUVORK5CYII=" size="lg" />
	</div>
	<div style="display: flex; flex-direction: row; gap: 8px; align-items: center">
		{#each PEOPLE as person}
			<Avatar name={person} />
		{/each}
	</div>
</div>
```

## GPUI notes

- The image is drawn with `objectfit="cover"` inside a root that sets `overflow: hidden`, so it is clipped to the circle or square.
- When `src` is set the initials are not rendered, and the component has no fallback if the image fails to load.
