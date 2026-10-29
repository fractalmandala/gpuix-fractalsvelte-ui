<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { Size } from '../types.ts';

	const SPACE = { sm: 4, md: 8, lg: 16 } as const;

	let {
		children,
		direction = 'column',
		gap = 'md',
		align = 'stretch',
		justify = 'start',
		wrap = false,
		padding = 0,
		style = null,
		testid = null
	}: {
		children: Snippet;
		direction?: 'row' | 'column';
		/** Spacing scale (sm 4, md 8, lg 16) or px. */
		gap?: Size | number;
		align?: 'start' | 'center' | 'end' | 'stretch';
		justify?: 'start' | 'center' | 'end' | 'between' | 'around';
		wrap?: boolean;
		/** Spacing scale or px, on all four sides. */
		padding?: Size | number;
		style?: string | null;
		testid?: string | null;
	} = $props();

	const px = (v: Size | number) => (typeof v === 'number' ? v : SPACE[v]);
	const css = $derived(`gap: ${px(gap)}px; padding: ${px(padding)}px; ${style ?? ''}`);
</script>

<div class="stack {direction} al-{align} jc-{justify}" class:wrap style={css} testId={testid}>
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
