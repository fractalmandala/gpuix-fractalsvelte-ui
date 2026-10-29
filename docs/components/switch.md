---
title: Switch
description: On/off toggle with a track and thumb, optional label, and three sizes.
category: inputs
---

`Switch` is a controlled on/off control. The parent owns `checked` and updates it in `onchange`, which receives the next state. Clicking the track or label, or pressing Space while focused, requests the change.

```svelte
<script>
  import Switch from 'gpuix-fractalsvelte-ui/Switch.svelte';
  let notify = $state(false);
</script>

<Switch label="Notifications" checked={notify} onchange={(v) => (notify = v)} />

<Switch checked disabled>
  {#snippet children()}Locked on{/snippet}
</Switch>
```

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `checked` | `boolean` | `false` |   |
| `onchange` | `(checked: boolean) => void` | — | Called with the next state when the track or label is clicked, or Space is pressed. |
| `label` | `string` | `''` | Plain-text label, ignored when `children` is given. |
| `children` | `Snippet` | — |   |
| `disabled` | `boolean` | `false` |   |
| `style` | `string \| null` | — |   |
| `testid` | `string \| null` | — |   |
## Tokens

`bg-surface`, `border-strong`, `radius-full`, `ring`, `switch-h`, `switch-thumb`, `switch-w`, `text-md`, `text-primary`, `text-theme`, `theme-color`
## Keyboard

| Key | Action |
| --- | --- |
| Space | Toggle while focused |

Enter does not toggle. A disabled switch is removed from the tab order (`tabindex -1`).

## Examples

Every variant, size and state, exactly as the gallery's Demo view renders them.

```svelte
<script lang="ts">
	import Switch from 'gpuix-fractalsvelte-ui/Switch.svelte';

	let wifi = $state(true);
	let sync = $state(false);
	let beta = $state(false);
</script>

<div style="display: flex; flex-direction: row; gap: 48px">
	<div style="display: flex; flex-direction: column; gap: 12px">
		<Switch label="Small" checked />
		<Switch label="Medium" checked={wifi} onchange={(v) => (wifi = v)} />
		<Switch label="Large" checked />
		<Switch label="Disabled" disabled />
		<Switch label="Disabled on" disabled checked />
	</div>

	<div style="display: flex; flex-direction: column; gap: 12px">
		<Switch label="Sync across devices" checked={sync} onchange={(v) => (sync = v)} />
		<Switch label="Join the beta" checked={beta} onchange={(v) => (beta = v)} />
		<div style="color: var(--text-secondary); font-size: var(--text-sm)">
			sync {sync ? 'on' : 'off'} · beta {beta ? 'on' : 'off'}
		</div>
	</div>
</div>
```

## GPUI notes

- The focus ring is the track's border colour, since GPUI has no outline.
- The thumb moves by flipping `justify-content` on the track, so it snaps rather than slides.
- The root row is clickable, so a click on the label toggles as well as a click on the track.
