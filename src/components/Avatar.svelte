<script lang="ts">
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
		size?: 'sm' | 'md' | 'lg';
		shape?: 'circle' | 'square';
		style?: string | null;
		testid?: string | null;
	} = $props();

	const words = $derived(name.trim().split(/\s+/).filter(Boolean));
	const initials = $derived(
		(words.length > 1 ? words[0][0] + words[words.length - 1][0] : (words[0] ?? '').slice(0, 1)).toUpperCase()
	);
	const TEXT = { sm: 'text-xs', md: 'text-sm', lg: 'text-md' } as const;
</script>

<div class="avatar avatar-{size} {shape === 'circle' ? 'radius-full' : 'radius-md'}" {style} testId={testid}>
	{#if src}
		<img class="img" {src} alt={name} objectfit="cover" testId={testid && `${testid}-img`} />
	{:else}
		<div class="initials {TEXT[size]}">{initials}</div>
	{/if}
</div>

<style>
	.avatar {
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
		background-color: var(--theme-color-sub);
	}
	.img { width: 100%; height: 100%; }
	.initials { color: var(--theme-color); font-weight: 600; user-select: none; }
</style>
