<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { GpuixEvent } from 'gpuix-fractalsvelte';
	import { use_join } from '../group.svelte.ts';
	import type { Size, Tone, Variant, Shape } from '../types.ts';

	let {
		children = undefined,
		label = '',
		variant = 'solid',
		tone = 'accent',
		size = 'md',
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
		variant?: Variant;
		tone?: Tone;
		size?: Size;
		shape?: Shape;
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
	let focused = $state(false);
	const live = $derived(!disabled && !loading);

	function activate(e: GpuixEvent) {
		if (live) onclick?.(e);
	}

	function key(e: GpuixEvent) {
		if (e.key === 'enter' || e.key === 'space') activate(e);
	}
</script>

<div
	class="btn {join() ? `j-${join()}` : ''} {variant} {tone} {size} {shape}"
	class:on={live}
	class:off={!live}
	class:full
	class:focused
	tabindex={disabled ? -1 : 0}
	onclick={activate}
	onkeydown={key}
	onfocus={() => (focused = true)}
	onblur={() => (focused = false)}
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
		border-width: 1px;
		border-color: #00000000;
		font-weight: 500;
		white-space: nowrap;
		user-select: none;
		cursor: pointer;
	}
	.btn.sm { height: 26px; padding: 0 10px; font-size: var(--ui-text-sm);}
	.btn.md { height: 32px; padding: 0 14px; font-size: var(--ui-text-md);}
	.btn.lg { height: 40px; padding: 0 18px; font-size: var(--ui-text-lg);}
	.btn.full { width: 100%; }
	.btn.off { opacity: 0.5; cursor: not-allowed; }
	.btn.rect { border-radius: var(--ui-radius-0); }
	.btn.min { border-radius: var(--ui-radius-sm); }
	.btn.modern { border-radius: var(--ui-radius-bs); }
	.btn.curved { border-radius: var(--ui-radius-lg); }
	.btn.round { border-radius: var(--ui-radius-full); }

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
	.btn.focused { border-color: var(--ui-ring); }
	.btn.j-first { border-top-right-radius: 0; border-bottom-right-radius: 0; }
	.btn.j-middle { border-radius: 0; margin-left: -1px; }
	.btn.j-last { border-top-left-radius: 0; border-bottom-left-radius: 0; margin-left: -1px; }
</style>
