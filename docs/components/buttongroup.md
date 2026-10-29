---
title: ButtonGroup
description: Row of attached buttons, or a segmented single-select control driven by options and value.
category: actions
---

`ButtonGroup` has two modes. Give it `options` for a segmented, single-select control. Give it children to lay buttons out in a row.

```svelte
<script>
  import ButtonGroup from 'gpuix-fractalsvelte-ui/ButtonGroup.svelte';
  let range = $state('week');
</script>

<ButtonGroup
  options={[
    { value: 'day', label: 'Day' },
    { value: 'week', label: 'Week' },
    { value: 'year', label: 'Year', disabled: true }
  ]}
  value={range}
  onchange={(v) => (range = v)}
/>

<ButtonGroup>
  <Button variant="outline" tone="neutral" label="Left" />
  <Button variant="outline" tone="neutral" label="Right" />
</ButtonGroup>
```

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `options` | `{ value: string, label: string, disabled?: boolean }[]` | — | Segmented mode. The value type follows the options. |
| `value` | `string \| null` | `null` | The selected option's value. |
| `onchange` | `(value) => void` | — | Called with the picked value, never with the current one. |
| `children` | `Snippet` | — | Attached mode: the buttons to join. |
| `tone` | `'accent' \| 'neutral' \| 'success' \| 'warn' \| 'danger'` | `'accent'` | Colour of the selected segment. |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Segment heights 20 / 26 / 34 px. |
| `style` | `string` | — | Inline CSS for the group. |
| `testid` | `string` | — | Test id on the group. Segments get `<testid>-<value>`. |

## Tokens

`accent`, `accent-ink`, the same for `success`, `warn` and `danger`, `surface`, `raised`, `border`, `ink`, `ink-muted`, `ring`, `radius-sm/md`, `text-sm/md/lg`.

## Keyboard

| Key | Action |
| --- | --- |
| Tab | Moves focus to the segmented group (one stop) |
| Left, Up | Select the previous enabled option, wrapping |
| Right, Down | Select the next enabled option, wrapping |

## GPUI notes

- Segmented mode is one focusable track, not one tab stop per segment, as in a native radio group.
- In attached mode, `Button`, `IconButton` and `Toggle` children join automatically. Through context they learn whether they are first, middle or last, square their inner corners, and overlap borders by 1px so seams never double. Other children are laid out edge to edge unchanged.
