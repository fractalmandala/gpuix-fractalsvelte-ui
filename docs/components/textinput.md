---
title: TextInput
description: Single-line text field with label, hint or error text, leading and trailing slots, and three sizes.
category: inputs
---

`TextInput` is a controlled single-line field. The parent owns `value` and updates it in `onchange`, which receives the new text. Enter calls `onsubmit` with the current text.

```svelte
<script>
  import TextInput from 'gpuix-fractalsvelte-ui/TextInput.svelte';
  let name = $state('');
</script>

<TextInput label="Name" placeholder="Your name" hint="Shown under the field" value={name} onchange={(v) => (name = v)} />

<TextInput label="Email" value={email} error="Enter a valid email" onchange={(v) => (email = v)} />

<TextInput size="lg" placeholder="Search" onsubmit={(q) => search(q)}>
  {#snippet leading()}⌕{/snippet}
</TextInput>
```

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `value` | `string` | `''` | Current text. |
| `onchange` | `(value: string) => void` | — | Called on every edit with the new text. |
| `onsubmit` | `(value: string) => void` | — | Called on Enter with the current text. |
| `placeholder` | `string` | `''` | Shown while empty. |
| `label` | `string` | `''` | Shown above the field. |
| `hint` | `string` | `''` | Shown under the field, unless `error` is set. |
| `error` | `string` | `''` | Shown under the field in the danger colour, in place of `hint`. Also turns the border red. |
| `disabled` | `boolean` | `false` | Greys the field, makes it read-only and removes it from the tab order. |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Field heights 26 / 32 / 40 px. |
| `leading` | `Snippet` | — | Inside the field, before the text. |
| `trailing` | `Snippet` | — | Inside the field, after the text. |
| `style` | `string \| null` | `null` | Inline CSS on the root. |
| `testid` | `string \| null` | `null` | Test id on the root. The field gets `${testid}-field`, the input `${testid}-input`, and the message `${testid}-msg`. |

## Tokens

`text-sm`, `text-md`, `text-lg`, `ink`, `ink-muted`, `surface`, `raised`, `border-strong`, `ring`, `danger`, `font`, `radius-sm`, `radius-md`, `radius-lg`.

## Keyboard

| Key | Action |
| --- | --- |
| Enter | Calls `onsubmit` with the current text |

## GPUI notes

- Clicks on the field, including its padding, focus the inner input, so the whole box is the hit area.
- The focus ring is a border colour change, since GPUI has no outline.
- A disabled field uses `readOnly` and reduced opacity. The disabled look is not a native disabled state.
- The inner input is a fixed height per size, and `leading` and `trailing` sit beside it inside the field.
