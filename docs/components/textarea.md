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
| `value` | `string` | `''` |   |
| `onchange` | `(value: string) => void` | — | Called on every edit with the new text. |
| `placeholder` | `string` | `''` |   |
| `label` | `string` | `''` | Shown above the field. |
| `hint` | `string` | `''` | Shown under the field, unless `error` is set. |
| `error` | `string` | `''` | Shown under the field in the danger colour, in place of `hint`. |
| `rows` | `number` | `3` | Visible height in lines; the field grows with its text from here. |
| `maxRows` | `number` | — | Stops growing at this many lines, then scrolls. Unset grows without limit. |
| `disabled` | `boolean` | `false` | Greys the field and ignores edits. |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Text size: fractalstyler's sm, md or lg. |
| `style` | `string \| null` | — |   |
| `testid` | `string \| null` | — |   |
## Tokens

`bg-raised`, `bg-surface`, `border-strong`, `danger`, `font-sans`, `radius-lg`, `radius-md`, `radius-sm`, `ring`, `text-primary`, `text-secondary`, `text-sm`
## Keyboard

None handled by the component. Enter inserts a line, as in any multi-line field.

## Examples

Every variant, size and state, exactly as the gallery's Demo view renders them.

```svelte
<script lang="ts">
	import TextArea from 'gpuix-fractalsvelte-ui/TextArea.svelte';
	let notes = $state('');
</script>

<div style="display: flex; flex-direction: column; gap: 16px; width: 360px">
	<TextArea
		label="Notes"
		placeholder="Write freely. The field grows with the text."
		hint="Enter adds a line"
		value={notes}
		onchange={(v) => (notes = v)}
		maxRows={6}
	/>
	<div style="color: var(--text-secondary); font-size: var(--text-sm)">{notes.length} characters</div>

	<TextArea size="sm" rows={2} placeholder="Small, two rows" />
	<TextArea size="lg" rows={2} placeholder="Large, two rows" />
	<TextArea label="Summary" value="This copy is too long for the field." error="Keep it under 120 characters" />
	<TextArea label="Changelog" value="Locked for the release." rows={2} disabled />
</div>
```

## GPUI notes

- Clicking anywhere in the box focuses the inner textarea, so the padding is part of the hit area.
- The focus ring is a border colour change, since GPUI has no outline.
- Line height is fixed in px per size, so `rows` and `maxRows` are exact line counts.
- A disabled field uses `readOnly` and reduced opacity. The disabled look is not a native disabled state.
