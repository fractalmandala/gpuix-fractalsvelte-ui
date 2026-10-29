<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { Size } from '../types.ts';

	const SPACE = { sm: 4, md: 8, lg: 16 } as const;

	let {
		children,
		columns = 2,
		gap = 'md',
		style = null,
		testid = null
	}: {
		children: Snippet;
		/** Number of equal-width columns. */
		columns?: number;
		/** Spacing scale (sm 4, md 8, lg 16) or px, between rows and columns. */
		gap?: Size | number;
		style?: string | null;
		testid?: string | null;
	} = $props();

	const css = $derived(
		`grid-template-columns: ${columns}; gap: ${typeof gap === 'number' ? gap : SPACE[gap]}px; ${style ?? ''}`
	);
</script>

<div class="grid" style={css} testId={testid}>
	{@render children()}
</div>

<style>
	.grid { display: grid; }
</style>
