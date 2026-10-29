<script lang="ts">
	import type { Size } from '../types.ts';

	let {
		name = '',
		src = null,
		size = 'md',
		shape = 'circle',
		style = null,
		testid = null
	}: {
		/** Initials come from the first and last word. */
		name?: string;
		/** Image path or URL; the initials show while it is unset. */
		src?: string | null;
		size?: Size;
		shape?: 'circle' | 'square';
		style?: string | null;
		testid?: string | null;
	} = $props();

	const words = $derived(name.trim().split(/\s+/).filter(Boolean));
	const initials = $derived(
		(words.length > 1 ? words[0][0] + words[words.length - 1][0] : (words[0] ?? '').slice(0, 1)).toUpperCase()
	);
</script>

<div class="avatar {size} {shape}" {style} testId={testid}>
	{#if src}
		<img class="img" {src} alt={name} objectfit="cover" testId={testid && `${testid}-img`} />
	{:else}
		<div class="initials {size}">{initials}</div>
	{/if}
</div>

<style>
	.avatar {
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
		background-color: var(--ui-accent-soft);
	}
	.avatar.sm { width: 24px; height: 24px; }
	.avatar.md { width: 32px; height: 32px; }
	.avatar.lg { width: 40px; height: 40px; }
	.avatar.circle { border-radius: var(--ui-radius-full); }
	.avatar.square { border-radius: var(--ui-radius-md); }
	.img { width: 100%; height: 100%; }
	.initials { color: var(--ui-accent); font-weight: 600; user-select: none; }
	.initials.sm { font-size: var(--ui-text-xs); }
	.initials.md { font-size: var(--ui-text-sm); }
	.initials.lg { font-size: var(--ui-text-md); }
</style>
