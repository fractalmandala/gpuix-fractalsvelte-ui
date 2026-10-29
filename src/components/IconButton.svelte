<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { GpuixEvent } from 'gpuix-fractalsvelte';
	import Tooltip from 'gpuix-fractalsvelte/components/Tooltip.svelte';
	import { use_join } from '../group.svelte.ts';
	import type { Size, Tone, Variant } from '../types.ts';

	type Hover = { onmouseenter?: () => void; onmouseleave?: () => void };

	let {
		children = undefined,
		glyph = '',
		label = '',
		variant = 'ghost',
		tone = 'neutral',
		size = 'md',
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
		variant?: Variant;
		tone?: Tone;
		size?: Size;
		disabled?: boolean;
		onclick?: (e: GpuixEvent) => void;
		style?: string | null;
		testid?: string | null;
	} = $props();

	const join = use_join();
	let focused = $state(false);
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
		class="btn {join() ? `j-${join()}` : ''} {variant} {tone} {size}"
		class:on={live}
		class:off={!live}
		class:focused
		tabindex={disabled ? -1 : 0}
		onclick={activate}
		onkeydown={key}
		onfocus={() => (focused = true)}
		onblur={() => (focused = false)}
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
	.btn {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		border-width: 1px;
		border-color: #00000000;
		border-radius: var(--ui-radius-md);
		font-weight: 500;
		user-select: none;
		cursor: pointer;
	}
	.btn.sm { width: 26px; height: 26px; font-size: var(--ui-text-sm); border-radius: var(--ui-radius-sm); }
	.btn.md { width: 32px; height: 32px; font-size: var(--ui-text-md); }
	.btn.lg { width: 40px; height: 40px; font-size: var(--ui-text-lg); border-radius: var(--ui-radius-lg); }
	.btn.off { opacity: 0.5; cursor: not-allowed; }

	.btn.solid.accent { background-color: var(--ui-accent); color: var(--ui-accent-ink); }
	.btn.on.solid.accent:hover { background-color: var(--ui-accent-hover); }
	.btn.solid.danger { background-color: var(--ui-danger); color: var(--ui-danger-ink); }
	.btn.on.solid.danger:hover { background-color: var(--ui-danger-hover); }
	.btn.solid.success { background-color: var(--ui-success); color: var(--ui-success-ink); }
	.btn.on.solid.success:hover { opacity: 0.9; }
	.btn.solid.warn { background-color: var(--ui-warn); color: var(--ui-warn-ink); }
	.btn.on.solid.warn:hover { opacity: 0.9; }
	.btn.solid.neutral { background-color: var(--ui-raised); color: var(--ui-ink); }
	.btn.on.solid.neutral:hover { background-color: var(--ui-border); }

	.btn.soft.accent { background-color: var(--ui-accent-soft); color: var(--ui-accent); }
	.btn.soft.danger { background-color: var(--ui-danger-soft); color: var(--ui-danger); }
	.btn.soft.success { background-color: var(--ui-success-soft); color: var(--ui-success); }
	.btn.soft.warn { background-color: var(--ui-warn-soft); color: var(--ui-warn); }
	.btn.soft.neutral { background-color: var(--ui-raised); color: var(--ui-ink-muted); }
	.btn.on.soft:hover { border-color: var(--ui-border-strong); }

	.btn.outline { background-color: #00000000; border-color: var(--ui-border-strong); }
	.btn.outline.accent { color: var(--ui-accent); }
	.btn.outline.danger { color: var(--ui-danger); }
	.btn.outline.success { color: var(--ui-success); }
	.btn.outline.warn { color: var(--ui-warn); }
	.btn.outline.neutral { color: var(--ui-ink); }
	.btn.on.outline:hover { background-color: var(--ui-raised); }

	.btn.ghost { background-color: #00000000; }
	.btn.ghost.accent { color: var(--ui-accent); }
	.btn.ghost.danger { color: var(--ui-danger); }
	.btn.ghost.success { color: var(--ui-success); }
	.btn.ghost.warn { color: var(--ui-warn); }
	.btn.ghost.neutral { color: var(--ui-ink-muted); }
	.btn.on.ghost:hover { background-color: var(--ui-raised); }
	.btn.on.ghost.neutral:hover { color: var(--ui-ink); }

	.btn.focused { border-color: var(--ui-ring); }
	.btn.j-first { border-top-right-radius: 0; border-bottom-right-radius: 0; }
	.btn.j-middle { border-radius: 0; margin-left: -1px; }
	.btn.j-last { border-top-left-radius: 0; border-bottom-left-radius: 0; margin-left: -1px; }
</style>
