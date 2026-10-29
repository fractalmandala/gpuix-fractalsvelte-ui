---
title: TextArea
description: Multi-line text field with label, hint or error text, and a height that grows with its content.
category: inputs
---

`TextArea` is a controlled multi-line field. The parent owns `value` and updates it in `onchange`, which receives the new text. The field starts at `rows` lines and grows with its text, up to `maxRows` if set.

```svelte
<script>
  import TextArea from 'gpuix-fractalsvelte-ui/TextArea.svelte';
  let notes = $state('');
</script>

<TextArea label="Notes" placeholder="Write something" hint="Shown under the field" value={notes} onchange={(v) => (notes = v)} />

<TextArea label="Bio" rows={2} maxRows={6} error="Too long" value={bio} onchange={(v) => (bio = v)} />
```

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `value` | `string` | `''` | Current text. |
| `onchange` | `(value: string) => void` | — | Called on every edit with the new text. |
| `placeholder` | `string` | `''` | Shown while empty. |
| `label` | `string` | `''` | Shown above the field. |
| `hint` | `string` | `''` | Shown under the field, unless `error` is set. |
| `error` | `string` | `''` | Shown under the field in the danger colour, in place of `hint`. Also turns the border red. |
| `rows` | `number` | `3` | Visible height in lines, used as the minimum. |
| `maxRows` | `number` | — | Stops growing at this many lines, then scrolls. Unset grows without limit. |
| `disabled` | `boolean` | `false` | Greys the field, makes it read-only and removes it from the tab order. |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Sets radius, padding and line height. |
| `style` | `string \| null` | `null` | Inline CSS on the root. |
| `testid` | `string \| null` | `null` | Test id on the root. The box gets `${testid}-box`, the textarea `${testid}-input`, and the message `${testid}-msg`. |

## Tokens

`text-sm`, `text-md`, `text-lg`, `ink`, `ink-muted`, `surface`, `raised`, `border-strong`, `ring`, `danger`, `font`, `radius-sm`, `radius-md`, `radius-lg`.

## Keyboard

None handled by the component. Enter inserts a line, as in any multi-line field.

## GPUI notes

- Clicking anywhere in the box focuses the inner textarea, so the padding is part of the hit area.
- The focus ring is a border colour change, since GPUI has no outline.
- Line height is fixed in px per size, so `rows` and `maxRows` are exact line counts.
- A disabled field uses `readOnly` and reduced opacity. The disabled look is not a native disabled state.
