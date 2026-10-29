<script lang="ts">
	import type { Snippet } from 'svelte';
	import Scroller from 'gpuix-fractalsvelte/components/Scroller.svelte';

	let {
		children,
		height = null,
		maxHeight = null,
		gap = 8,
		style = null,
		testid = null
	}: {
		children: Snippet;
		/** Fixed height in px. */
		height?: number | null;
		/** Height cap in px; the area shrinks to its content below the cap. */
		maxHeight?: number | null;
		/** px between the content's direct children. */
		gap?: number;
		style?: string | null;
		testid?: string | null;
	} = $props();

	const css = $derived(
		`${height == null ? '' : `height: ${height}px; `}${maxHeight == null ? '' : `max-height: ${maxHeight}px; `}${style ?? ''}`
	);
</script>

<div class="area" style={css} testId={testid}>
	<Scroller {gap} testid={testid && `${testid}-list`}>{@render children()}</Scroller>
</div>

<style>
	.area { display: flex; flex-direction: column; min-height: 0; }
</style>
