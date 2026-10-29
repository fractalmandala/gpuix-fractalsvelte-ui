<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { GpuixEvent } from 'gpuix-fractalsvelte';
	import { use_join } from '../group.svelte.ts';
	
	let {
		children = undefined,
		label = '',
		variant = 'primary',
		size = 'h-bs',
		shape = 'min',
		disabled = false,
		loading = false,
		full = false,
		leading = undefined,
		trailing = undefined,
		onclick = undefined,
		style = null,
		testid = null
	}: {
		/** Content; `label` is the plain-text shorthand. */
		children?: Snippet;
		label?: string;
		/** Fractalstyler's variant axis. */
		variant?: 'primary' | 'secondary' | 'themed' | 'outline' | 'ghost' | 'link' | 'info' | 'success' | 'warning' | 'danger';
		/** Fractalstyler's size axis. */
		size?: 'h-sm' | 'h-md' | 'h-bs' | 'h-lg' | 'h-xl';
		shape?: 'square' | 'min' | 'modern' | 'curved' | 'round';
		disabled?: boolean;
		/** Shows `…` in place of the content and swallows clicks. */
		loading?: boolean;
		/** Stretches to the parent's width. */
		full?: boolean;
		/** Snippet before the content, usually an icon. */
		leading?: Snippet;
		trailing?: Snippet;
		onclick?: (e: GpuixEvent) => void;
		style?: string | null;
		testid?: string | null;
	} = $props();

	const join = use_join();
	const live = $derived(!disabled && !loading);

	function activate(e: GpuixEvent) {
		if (live) onclick?.(e);
	}

	function key(e: GpuixEvent) {
		if (e.key === 'enter' || e.key === 'space') activate(e);
	}
</script>

<div
	class="btn el-variant {variant} el-shape {shape} el-size {size} px-bs {join() ? `j-${join()}` : ''}"
	class:on={live}
	class:off={!live}
	class:full
	tabindex={disabled ? -1 : 0}
	onclick={activate}
	onkeydown={key}
	{style}
	testId={testid}
>
	{#if leading}{@render leading()}{/if}
	{#if loading}…{:else if children}{@render children()}{:else}{label}{/if}
	{#if trailing}{@render trailing()}{/if}
</div>

<style>
	.btn {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
		gap: 6px;
		white-space: nowrap;
		user-select: none;
		cursor: pointer;
	}
	.btn.full { width: 100%; }
	.btn.off { opacity: 0.5; cursor: not-allowed; }
	.btn.j-first { border-top-right-radius: 0; border-bottom-right-radius: 0; }
	.btn.j-middle { border-radius: 0; margin-left: -1px; }
	.btn.j-last { border-top-left-radius: 0; border-bottom-left-radius: 0; margin-left: -1px; }
</style>
