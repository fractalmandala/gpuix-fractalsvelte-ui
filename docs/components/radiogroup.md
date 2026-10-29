---
title: RadioGroup
description: Pick one of a few options, in a column or a row, with arrow-key navigation.
category: inputs
---

`RadioGroup` shows a set of options and reports the one the user picks. Each option is a focusable `div`, so arrow keys and Space work in any GPUI tree.

```svelte
<script>
  import RadioGroup from 'gpuix-fractalsvelte-ui/RadioGroup.svelte';
  let plan = $state('monthly');
</script>

<RadioGroup
  options={[
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' },
    { value: 'lifetime', label: 'Lifetime', disabled: true }
  ]}
  value={plan}
  onchange={(v) => (plan = v)}
/>
<RadioGroup options={views} value={view} direction="row" onchange={(v) => (view = v)} />
```

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `options` | `{ value: string; label: string; disabled?: boolean }[]` | — | Options in display order. |
| `value` | `string \| null` | `null` | The checked option's value. |
| `onchange` | `(value: string) => void` | — | Called with the new value, not the event. Not called for the checked option. |
| `direction` | `'row' \| 'column'` | `'column'` | Stack vertically or lay out in a row. |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Row heights 22 / 28 / 34 px. |
| `disabled` | `boolean` | `false` | Dims the whole group and ignores input. |
| `style` | `string` | — | Inline CSS on the group; wins over the component's rules. |
| `testid` | `string` | — | Test id on the group; each option gets `<testid>-<value>`. |

## Tokens

`accent`, `surface`, `border-strong`, `ring`, `ink`, `radius-full`, `text-sm/md/lg`.

## Keyboard

| Key | Action |
| --- | --- |
| Down, Right | Select the next enabled option, wrapping at the end |
| Up, Left | Select the previous enabled option, wrapping at the start |
| Space | Select the focused option |

## GPUI notes

- The focus ring is a border colour change on the circle, since GPUI has no outline or shadow.
- Arrow keys move focus with the selection through `get_native().focusElement`, which works in headless tests too. The `focus_element` window helper is a no-op headless.
- Every enabled option is a tab stop, so Tab visits each one. A roving tab stop (one per group) would match native radios more closely; it is not implemented.
