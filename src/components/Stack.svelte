<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		children,
		direction = 'column',
		gap = 'sm',
		align = 'stretch',
		justify = 'start',
		wrap = false,
		padding = undefined,
		style = null,
		testid = null
	}: {
		children: Snippet;
		direction?: 'row' | 'column';
		/** Fractalstyler's gap steps, or px. */
		gap?: 'xs' | 'sm' | 'md' | 'bs' | 'lg' | 'xl' | number;
		align?: 'start' | 'center' | 'end' | 'stretch';
		justify?: 'start' | 'center' | 'end' | 'between' | 'around';
		wrap?: boolean;
		/** Fractalstyler's padding steps, or px, on all four sides. */
		padding?: 'sm' | 'md' | 'lg' | number;
		style?: string | null;
		testid?: string | null;
	} = $props();

	const css = $derived(
		`${typeof gap === 'number' ? `gap: ${gap}px; ` : ''}${typeof padding === 'number' ? `padding: ${padding}px; ` : ''}${style ?? ''}`
	);
</script>

<div
	class="stack {direction} al-{align} jc-{justify} {typeof gap === 'string' ? `gap-${gap}` : ''} {typeof padding === 'string' ? `pad-${padding}` : ''}"
	class:wrap
	style={css}
	testId={testid}
>
	{@render children()}
</div>

<style>
	.stack { display: flex; }
	.stack.row { flex-direction: row; }
	.stack.column { flex-direction: column; }
	.stack.wrap { flex-wrap: wrap; }
	.al-start { align-items: start; }
	.al-center { align-items: center; }
	.al-end { align-items: end; }
	.jc-start { justify-content: start; }
	.jc-center { justify-content: center; }
	.jc-end { justify-content: end; }
	.jc-between { justify-content: space-between; }
	.jc-around { justify-content: space-around; }
</style>
