<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { Size } from '../types.ts';

	const SPACE = { sm: 4, md: 8, lg: 16 } as const;

	let {
		children = undefined,
		padding = 0,
		bg = 'none',
		border = false,
		radius = 'md',
		style = null,
		testid = null
	}: {
		children?: Snippet;
		/** Spacing scale or px, on all four sides. */
		padding?: Size | number;
		bg?: 'surface' | 'raised' | 'none';
		border?: boolean;
		radius?: 'none' | 'sm' | 'md' | 'lg';
		style?: string | null;
		testid?: string | null;
	} = $props();

	const css = $derived(`padding: ${typeof padding === 'number' ? padding : SPACE[padding]}px; ${style ?? ''}`);
</script>

<div class="box {bg} r-{radius}" class:bordered={border} style={css} testId={testid}>
	{@render children?.()}
</div>

<style>
	.box { display: flex; flex-direction: column; }
	.box.surface { background-color: var(--ui-surface); }
	.box.raised { background-color: var(--ui-raised); }
	.box.none { background-color: #00000000; }
	.box.bordered { border-width: 1px; border-color: var(--ui-border); }
	.r-none { border-radius: 0px; }
	.r-sm { border-radius: var(--ui-radius-sm); }
	.r-md { border-radius: var(--ui-radius-md); }
	.r-lg { border-radius: var(--ui-radius-lg); }
</style>
