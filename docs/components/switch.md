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

<Switch size="lg" checked disabled>
  {#snippet children()}Locked on{/snippet}
</Switch>
```

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `checked` | `boolean` | `false` | Current state. |
| `onchange` | `(checked: boolean) => void` | — | Called with the next state. Not called when disabled. |
| `label` | `string` | `''` | Plain-text label. Ignored when `children` is given. |
| `children` | `Snippet` | — | Rich label. |
| `disabled` | `boolean` | `false` | Dims the control, leaves the tab order and ignores clicks. |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Track sizes 28×16, 36×20 and 44×24 px. |
| `style` | `string \| null` | `null` | Inline CSS on the root row. |
| `testid` | `string \| null` | `null` | Test id on the root. The track gets `${testid}-track` and the thumb `${testid}-thumb`. |

The root carries `role="switch"` and uses `label` as its accessible name.

## Tokens

`border-strong`, `surface`, `accent`, `accent-ink`, `ring`, `ink`, `radius-full`, `text-sm`, `text-md`, `text-lg`.

## Keyboard

| Key | Action |
| --- | --- |
| Space | Toggle while focused |

Enter does not toggle. A disabled switch is removed from the tab order (`tabindex -1`).

## GPUI notes

- The focus ring is the track's border colour, since GPUI has no outline.
- The thumb moves by flipping `justify-content` on the track, so it snaps rather than slides.
- The root row is clickable, so a click on the label toggles as well as a click on the track.
