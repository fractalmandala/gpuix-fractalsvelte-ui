<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { GpuixEvent } from 'gpuix-fractalsvelte';
	import Tooltip from 'gpuix-fractalsvelte/components/Tooltip.svelte';
	import { use_join } from '../group.svelte.ts';
	
	type Hover = { onmouseenter?: () => void; onmouseleave?: () => void };

	let {
		children = undefined,
		glyph = '',
		label = '',
		variant = 'ghost',
		size = 'h-bs',
		shape = 'min',
		disabled = false,
		onclick = undefined,
		style = null,
		testid = null
	}: {
		/** The icon; `glyph` is the plain-text shorthand. */
		children?: Snippet;
		glyph?: string;
		/** Tooltip text shown after a short hover. */
		label?: string;
		/** Fractalstyler's variant axis. */
		variant?: 'primary' | 'secondary' | 'themed' | 'outline' | 'ghost' | 'link' | 'info' | 'success' | 'warning' | 'danger';
		/** Fractalstyler's size axis; the button is a square of that height. */
		size?: 'h-sm' | 'h-md' | 'h-bs' | 'h-lg' | 'h-xl';
		shape?: 'square' | 'min' | 'modern' | 'curved' | 'round';
		disabled?: boolean;
		onclick?: (e: GpuixEvent) => void;
		style?: string | null;
		testid?: string | null;
	} = $props();

	const join = use_join();
	const live = $derived(!disabled);

	function activate(e: GpuixEvent) {
		if (live) onclick?.(e);
	}

	function key(e: GpuixEvent) {
		if (e.key === 'enter' || e.key === 'space') activate(e);
	}
</script>

{#snippet button(hover: Hover)}
	<div
		class="btn-icon el-variant {variant} el-shape {shape} el-size {size} {join() ? `j-${join()}` : ''}"
		class:off={!live}
		tabindex={disabled ? -1 : 0}
		onclick={activate}
		onkeydown={key}
		{...hover}
		{style}
		testId={testid}
	>
		{#if children}{@render children()}{:else}{glyph}{/if}
	</div>
{/snippet}

{#if label}
	<Tooltip content={label}>
		{#snippet children(hover)}
			{@render button(hover)}
		{/snippet}
	</Tooltip>
{:else}
	{@render button({})}
{/if}

<style>
	.btn-icon {
		flex-shrink: 0;
		user-select: none;
		cursor: pointer;
	}
	.btn-icon.off { opacity: 0.5; cursor: not-allowed; }
	.btn-icon.j-first { border-top-right-radius: 0; border-bottom-right-radius: 0; }
	.btn-icon.j-middle { border-radius: 0; margin-left: -1px; }
	.btn-icon.j-last { border-top-left-radius: 0; border-bottom-left-radius: 0; margin-left: -1px; }
</style>
