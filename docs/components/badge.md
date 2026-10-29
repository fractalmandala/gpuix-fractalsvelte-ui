---
title: Badge
description: Small pill label for counts, statuses and tags, in five variants and three variants.
category: feedback
---

`Badge` is a non-interactive pill. Use `label` for plain text, or pass children for rich content.

```svelte
<script>
  import Badge from 'gpuix-fractalsvelte-ui/Badge.svelte';
</script>

<Badge label="New" variant="themed" />
<Badge label="3 errors" variant="danger" />
<Badge label="Draft" size="h-sm" />
```

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `children` | `Snippet` | — | Content; `label` is the plain-text shorthand. |
| `label` | `string` | `''` |   |
| `variant` | `'secondary' \| 'info' \| 'success' \| 'warning' \| 'danger'` | `'secondary'` | Fractalstyler's status names, drawn as a tinted pill. |
| `size` | `'sm' \| 'md'` | `'md'` |   |
| `style` | `string \| null` | — |   |
| `testid` | `string \| null` | — |   |
## Tokens

`bg-raised`, `danger`, `danger-soft`, `info`, `info-soft`, `radius-full`, `success`, `success-soft`, `text-secondary`, `text-sm`, `text-xs`, `warning`, `warning-soft`
## Examples

Every variant, size and state, exactly as the gallery's Demo view renders them.

```svelte
<script lang="ts">
	import Badge from 'gpuix-fractalsvelte-ui/Badge.svelte';
	const VARIANTS = ['secondary', 'info', 'success', 'warning', 'danger'] as const;
</script>

<div style="display: flex; flex-direction: column; gap: 12px">
	<div style="display: flex; flex-direction: row; gap: 8px; align-items: center">
		{#each VARIANTS as variant}
			<Badge {variant} label={variant} />
		{/each}
	</div>
	<div style="display: flex; flex-direction: row; gap: 8px; align-items: center">
		<Badge size="sm" label="Small" />
		<Badge size="md" label="Medium" />
		<Badge variant="success" label="Live" />
		<Badge variant="danger" label="3 errors" />
	</div>
</div>
```

## GPUI notes

- Each variant is its own class (`.badge.danger`), because GPUI has no nesting.
- The base rule sets a transparent border, so only the `outline` variant shows a border.
