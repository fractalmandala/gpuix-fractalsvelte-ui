<script lang="ts">
	import type { Snippet } from 'svelte';

	const PAD = { sm: 'pad-sm', md: 'pad-md', lg: 'pad-lg' } as const;
	const RADIUS = { sm: 'radius-sm', md: 'radius-md', lg: 'radius-lg' } as const;

	let {
		children = undefined,
		padding = undefined,
		bg = 'none',
		border = false,
		radius = 'md',
		style = null,
		testid = null
	}: {
		children?: Snippet;
		/** Fractalstyler's padding steps, or px. */
		padding?: 'sm' | 'md' | 'lg' | number;
		bg?: 'surface' | 'raised' | 'none';
		border?: boolean;
		radius?: 'none' | 'sm' | 'md' | 'lg';
		style?: string | null;
		testid?: string | null;
	} = $props();

	const pad = $derived(padding === undefined ? '' : typeof padding === 'number' ? `padding: ${padding}px; ` : '');
	const css = $derived(`${pad}${radius === 'none' ? 'border-radius: 0px; ' : ''}${style ?? ''}`);
</script>

<div
	class="box {bg === 'none' ? '' : `bg-${bg}`} {typeof padding === 'string' ? PAD[padding] : ''} {radius === 'none' ? '' : RADIUS[radius]} {border ? 'border' : ''}"
	style={css}
	testId={testid}
>
	{@render children?.()}
</div>
