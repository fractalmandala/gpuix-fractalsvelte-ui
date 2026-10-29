<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		children,
		columns = 2,
		gap = 'md',
		style = null,
		testid = null
	}: {
		children: Snippet;
		/** Number of equal-width columns, 1 to 6 (fractalstyler's grid-N classes). */
		columns?: 1 | 2 | 3 | 4 | 5 | 6;
		/** Fractalstyler's gap steps, or px. */
		gap?: 'xs' | 'sm' | 'md' | 'bs' | 'lg' | 'xl' | number;
		style?: string | null;
		testid?: string | null;
	} = $props();
</script>

<div class="grid grid-fixed-{columns}" style="{typeof gap === 'number' ? `gap: ${gap}px; ` : ''}{style ?? ''}" testId={testid} class:gap-xs={gap === 'xs'} class:gap-sm={gap === 'sm'} class:gap-md={gap === 'md'} class:gap-bs={gap === 'bs'} class:gap-lg={gap === 'lg'} class:gap-xl={gap === 'xl'}>
	{@render children()}
</div>
