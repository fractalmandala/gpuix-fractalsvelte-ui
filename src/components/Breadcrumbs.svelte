<script lang="ts">
	import { focus_element, type GpuixEvent, type ShadowNode } from 'gpuix-fractalsvelte';

	let {
		items,
		separator = '/',
		size = 'md',
		style = null,
		testid = null
	}: {
		/** Ancestors with an `onclick` are links; the last item is the current page. */
		items: { label: string; onclick?: () => void }[];
		separator?: string;
		/** Fractalstyler's text sizes. */
		size?: 'sm' | 'md' | 'lg';
		style?: string | null;
		testid?: string | null;
	} = $props();

	let focused = $state<number | null>(null);

	function key(e: GpuixEvent, onclick: () => void) {
		if (e.key === 'enter' || e.key === 'space') onclick();
	}
</script>

<div class="crumbs {size}" {style} testId={testid}>
	{#each items as item, i (i)}
		{@const current = i === items.length - 1}
		{#if i > 0}<div class="sep">{separator}</div>{/if}
		<div
			class="crumb"
			class:clickable={!!item.onclick}
			class:current
			class:focused={focused === i}
			tabindex={item.onclick ? 0 : undefined}
			onclick={item.onclick}
			onkeydown={item.onclick ? (e: GpuixEvent) => key(e, item.onclick!) : undefined}
			onfocus={() => (focused = i)}
			onblur={() => (focused = null)}
			testId={testid && `${testid}-${i}`}
		>{item.label}</div>
	{/each}
</div>

<style>
	.crumbs { display: flex; flex-direction: row; align-items: center; gap: 2px; white-space: nowrap; }
	.crumbs.sm { font-size: var(--text-sm); line-height: 22px; }
	.crumbs.md { font-size: var(--text-md); line-height: 26px; }
	.crumbs.lg { font-size: var(--text-lg); line-height: 32px; }
	.crumb {
		padding: 0 6px;
		border-width: 1px;
		border-color: #00000000;
		border-radius: var(--radius-sm);
		color: var(--text-secondary);
		user-select: none;
	}
	.crumb.clickable { cursor: pointer; }
	.crumb.clickable:hover { background-color: var(--bg-raised); color: var(--text-primary); }
	.crumb.current { color: var(--text-primary); font-weight: 600; }
	.crumb.focused { border-color: var(--ring); }
	.sep { padding: 0 2px; color: var(--text-muted); }
</style>
