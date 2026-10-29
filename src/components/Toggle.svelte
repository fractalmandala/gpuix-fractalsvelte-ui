<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { GpuixEvent } from 'gpuix-fractalsvelte';
	import { use_join } from '../group.svelte.ts';

	let {
		children = undefined,
		label = '',
		pressed = false,
		onchange = undefined,
		variant = 'outline',
		pressedVariant = 'themed',
		size = 'h-bs',
		disabled = false,
		style = null,
		testid = null
	}: {
		children?: Snippet;
		label?: string;
		/** Whether the toggle is on. Pair with `onchange`. */
		pressed?: boolean;
		/** Called with the next pressed state. */
		onchange?: (pressed: boolean) => void;
		variant?: 'outline' | 'ghost';
		/** Colour of the pressed state, in fractalstyler's names. */
		pressedVariant?: 'themed' | 'secondary' | 'info' | 'success' | 'warning' | 'danger';
		/** Fractalstyler's height steps. */
		size?: 'h-sm' | 'h-md' | 'h-bs' | 'h-lg' | 'h-xl';
		disabled?: boolean;
		style?: string | null;
		testid?: string | null;
	} = $props();

	const join = use_join();
	let focused = $state(false);
	const live = $derived(!disabled);

	function flip(e: GpuixEvent) {
		if (live) onchange?.(!pressed);
	}

	function key(e: GpuixEvent) {
		if (e.key === 'enter' || e.key === 'space') flip(e);
	}
</script>

<div
	class="toggle el-size {size} {join() ? `j-${join()}` : ''} {variant} {pressed ? `pressed-${pressedVariant}` : ''}"
	class:pressed
	class:idle={!pressed}
	class:on={live}
	class:off={!live}
	class:focused
	tabindex={disabled ? -1 : 0}
	onclick={flip}
	onkeydown={key}
	onfocus={() => (focused = true)}
	onblur={() => (focused = false)}
	{style}
	testId={testid}
>
	{#if children}{@render children()}{:else}{label}{/if}
</div>

<style>
	.toggle {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
		gap: 6px;
		border-width: 1px;
		border-color: #00000000;
		border-radius: var(--radius-md);
		font-weight: 500;
		white-space: nowrap;
		user-select: none;
		cursor: pointer;
		color: var(--text-secondary);
	}
	.toggle.off { opacity: 0.5; cursor: not-allowed; }

	.toggle.outline { background-color: #00000000; border-color: var(--border-strong); }
	.toggle.ghost { background-color: #00000000; }
	.toggle.on.idle:hover { background-color: var(--bg-raised); color: var(--text-primary); }

	.toggle.pressed-themed { background-color: var(--theme-color-sub); color: var(--theme-color); }
	.toggle.pressed-secondary { background-color: var(--bg-raised); color: var(--text-primary); }
	.toggle.pressed-info { background-color: var(--info-soft); color: var(--info); }
	.toggle.pressed-success { background-color: var(--success-soft); color: var(--success); }
	.toggle.pressed-warning { background-color: var(--warning-soft); color: var(--warning); }
	.toggle.pressed-danger { background-color: var(--danger-soft); color: var(--danger); }

	.toggle.focused { border-color: var(--ring); }
	.toggle.j-first { border-top-right-radius: 0; border-bottom-right-radius: 0; }
	.toggle.j-middle { border-radius: 0; margin-left: -1px; }
	.toggle.j-last { border-top-left-radius: 0; border-bottom-left-radius: 0; margin-left: -1px; }
</style>
