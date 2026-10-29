---
title: Select
description: Dropdown that picks one option from a list, with keyboard navigation and a scrolling list for long option sets.
category: inputs
---

`Select` shows the chosen option in a trigger and opens a list beside it. The list is a `Popover`, so it closes on an outside press and on Escape.

```svelte
<script>
  import Select from 'gpuix-fractalsvelte-ui/Select.svelte';
  let fruit = $state(null);
</script>

<Select
  options={[
    { value: 'apple', label: 'Apple' },
    { value: 'banana', label: 'Banana' },
    { value: 'date', label: 'Date', disabled: true }
  ]}
  value={fruit}
  onchange={(v) => (fruit = v)}
  placeholder="Pick a fruit"
/>
```

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `options` | `{ value: string; label: string; disabled?: boolean }[]` | — | Options in display order. |
| `value` | `string \| null` | `null` | The chosen option's value. `null` shows the placeholder. |
| `onchange` | `(value: string) => void` | — | Called with the new value, after the list closes. |
| `placeholder` | `string` | `'Select…'` | Shown when nothing is chosen. |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Trigger heights 26 / 32 / 40 px. |
| `disabled` | `boolean` | `false` | Dims the trigger and keeps the list shut. |
| `style` | `string` | — | Inline CSS on the trigger; wins over the component's rules. The default width is 200 px. The list matches the trigger's width. |
| `testid` | `string` | — | Test id on the root. The trigger gets `<testid>-trigger`, each option `<testid>-option-<value>`, and the list `<testid>-panel`. |

Lists longer than eight options scroll inside the panel.

## Tokens

`surface`, `overlay`, `border-strong`, `border`, `ink`, `ink-muted`, `ink-faint`, `raised`, `accent`, `ring`, `radius-sm/md/lg`, `text-xs/sm/md/lg`.

## Keyboard

| Key | Closed | Open |
| --- | --- | --- |
| Enter, Space, Down, Up | Open the list | Enter and Space pick the highlighted option |
| Down | — | Highlight the next enabled option |
| Up | — | Highlight the previous enabled option |
| Escape | — | Close without changing the value |
| Tab | — | Close |

Focus stays on the trigger while the list is open. The arrow keys move a highlight, not focus.

## GPUI notes

- The panel's colours come from inline `var(--ui-*)` in `style`, since `Popover`'s own fallbacks are dark and would show in the light theme.
- Opening the list highlights the chosen option, or the first enabled one.
- The highlighted row is scrolled into view with `get_native().scrollIntoView`, which the headless renderer does not implement, so that scroll is only verified in a window.
