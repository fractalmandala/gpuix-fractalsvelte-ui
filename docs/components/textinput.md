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

<TextInput size="h-xl" placeholder="Search" onsubmit={(q) => search(q)}>
  {#snippet leading()}⌕{/snippet}
</TextInput>
```

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `value` | `string` | `''` |   |
| `onchange` | `(value: string) => void` | — | Called on every edit with the new text. |
| `onsubmit` | `(value: string) => void` | — | Called on Enter with the current text. |
| `placeholder` | `string` | `''` |   |
| `label` | `string` | `''` | Shown above the field. |
| `hint` | `string` | `''` | Shown under the field, unless `error` is set. |
| `error` | `string` | `''` | Shown under the field in the danger colour, in place of `hint`. |
| `disabled` | `boolean` | `false` | Greys the field and ignores edits. |
| `size` | `'h-md' \| 'h-lg' \| 'h-xl'` | `'h-lg'` | Fractalstyler's height steps for the field. |
| `leading` | `Snippet` | — | Snippet inside the field, before the text. |
| `trailing` | `Snippet` | — | Snippet inside the field, after the text. |
| `style` | `string \| null` | — |   |
| `testid` | `string \| null` | — |   |
## Tokens

`bg-raised`, `bg-surface`, `border-strong`, `danger`, `font-sans`, `radius-md`, `ring`, `text-primary`, `text-secondary`, `text-sm`
## Keyboard

| Key | Action |
| --- | --- |
| Enter | Calls `onsubmit` with the current text |

## Examples

Every variant, size and state, exactly as the gallery's Demo view renders them.

```svelte
<script lang="ts">
	import TextInput from 'gpuix-fractalsvelte-ui/TextInput.svelte';
	let name = $state('');
	let site = $state('');
	let submitted = $state('');
	let query = $state('');
</script>

<div style="display: flex; flex-direction: column; gap: 16px; width: 360px">
	<div style="display: flex; flex-direction: row; gap: 8px; align-items: flex-end">
		<TextInput size="h-md" placeholder="Small" style="flex-grow: 1; flex-basis: 0; min-width: 0" />
		<TextInput size="h-lg" placeholder="Medium" style="flex-grow: 1; flex-basis: 0; min-width: 0" />
		<TextInput size="h-xl" placeholder="Large" style="flex-grow: 1; flex-basis: 0; min-width: 0" />
	</div>

	<TextInput
		label="Name"
		placeholder="Ada Lovelace"
		hint="Shown on your profile"
		value={name}
		onchange={(v) => (name = v)}
		onsubmit={(v) => (submitted = v)}
	/>
	<div style="color: var(--text-secondary); font-size: var(--text-sm)">submitted: {submitted || '—'}</div>

	<TextInput label="Website" placeholder="example.com" value={site} onchange={(v) => (site = v)}>
		{#snippet leading()}<div>https://</div>{/snippet}
	</TextInput>

	<TextInput
		placeholder="Search notes"
		value={query}
		onchange={(v) => (query = v)}
	>
		{#snippet trailing()}<div style="font-size: var(--text-xs)">esc</div>{/snippet}
	</TextInput>

	<TextInput label="Email" value="ada@" error="Enter a valid email address" />
	<TextInput label="Organisation" value="Analytical Engine Ltd" disabled hint="Managed by your admin" />
</div>
```

## GPUI notes

- Clicks on the field, including its padding, focus the inner input, so the whole box is the hit area.
- The focus ring is a border colour change, since GPUI has no outline.
- A disabled field uses `readOnly` and reduced opacity. The disabled look is not a native disabled state.
- The inner input is a fixed height per size, and `leading` and `trailing` sit beside it inside the field.
