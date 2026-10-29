---
title: Card
description: Surface with a header, body and footer, optionally clickable as a whole.
category: layout
---

`Card` groups related content under an optional title and description, with slots for header actions and footer buttons. With `clickable` the whole card becomes one action.

```svelte
<script>
  import Card from 'gpuix-fractalsvelte-ui/Card.svelte';
  import Button from 'gpuix-fractalsvelte-ui/Button.svelte';
</script>

<Card title="Project" description="Last edited 2h ago">
  Body copy for the card.
  {#snippet actions()}
    <Button label="Star" variant="ghost" size="h-md" onclick={star} />
  {/snippet}
  {#snippet footer()}
    <Button label="Open" size="h-md" onclick={open} />
  {/snippet}
</Card>

<Card title="Recent file" clickable onclick={openFile}>Click anywhere to open.</Card>
```

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `children` | `Snippet` | — |   |
| `title` | `string` | `''` |   |
| `description` | `string` | `''` |   |
| `actions` | `Snippet` | — | Right side of the header, e.g. icon buttons. |
| `footer` | `Snippet` | — |   |
| `padding` | `'sm' \| 'md' \| 'lg' \| number` | `'lg'` | Spacing scale or px, on all four sides. |
| `clickable` | `boolean` | `false` | Hover highlight, focus ring, and `onclick` on click, Enter or Space. |
| `onclick` | `(e: GpuixEvent) => void` | — |   |
| `style` | `string \| null` | — |   |
| `testid` | `string \| null` | — |   |
## Tokens

`bg-raised`, `bg-surface`, `border`, `radius-lg`, `ring`, `text-lg`, `text-primary`, `text-secondary`, `text-sm`
## Keyboard

| Key | Action |
| --- | --- |
| Enter, Space | Run `onclick` while focused (only when `clickable`) |

## Examples

Every variant, size and state, exactly as the gallery's Demo view renders them.

```svelte
<script lang="ts">
	import Card from 'gpuix-fractalsvelte-ui/Card.svelte';
	import Button from 'gpuix-fractalsvelte-ui/Button.svelte';
	let opened = $state(0);
	let starred = $state(false);
</script>

<div style="display: flex; flex-direction: column; gap: 16px">
	<div style="display: flex; flex-direction: row; gap: 16px; align-items: start">
		<div style="flex-grow: 1; flex-basis: 0; min-width: 0">
			<Card title="Project Atlas" description="Edited 2 hours ago">
				Shared with 4 people. Last build passed on main.
				{#snippet footer()}
					<Button label="Cancel" variant="ghost" size="h-md" />
					<Button label="Open" size="h-md" />
				{/snippet}
			</Card>
		</div>
		<div style="flex-grow: 1; flex-basis: 0; min-width: 0">
			<Card title="Quarterly report" description="Draft · 12 pages">
				{#snippet actions()}
					<Button label={starred ? 'Starred' : 'Star'} variant={starred ? 'themed' : 'ghost'} size="h-md" onclick={() => (starred = !starred)} />
				{/snippet}
				Finance numbers are final. Review the summary before sending.
			</Card>
		</div>
	</div>
	<Card title="Compact" description="padding sm" padding="sm">Tight padding.</Card>
	<Card title="Open a workspace" description="Click the card to open it" clickable onclick={() => opened++}>
		<div style="color: var(--text-secondary)">Opened {opened} times.</div>
	</Card>
</div>
```

## GPUI notes

- A clickable card is focusable (`tabindex` 0). Its focus ring is a border colour change.
- The `actions` and `footer` rows sit on a near-transparent fill with an `onclick` that does nothing. This stops a button's click from also running the card's `onclick`.
- Only the `clickable` card gets a `cursor: pointer` and hover background.
