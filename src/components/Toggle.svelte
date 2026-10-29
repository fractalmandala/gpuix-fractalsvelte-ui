<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { GpuixEvent } from 'gpuix-fractalsvelte';
	import { use_join } from '../group.svelte.ts';
	import type { Size, Tone } from '../types.ts';

	let {
		children = undefined,
		label = '',
		pressed = false,
		onchange = undefined,
		variant = 'outline',
		tone = 'accent',
		size = 'md',
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
		/** Colour of the pressed state. */
		tone?: Tone;
		size?: Size;
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
	class="toggle {join() ? `j-${join()}` : ''} {variant} {size} {tone}"
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
		border-radius: var(--ui-radius-md);
		font-weight: 500;
		white-space: nowrap;
		user-select: none;
		cursor: pointer;
		color: var(--ui-ink-muted);
	}
	.toggle.sm { height: 26px; padding: 0 10px; font-size: var(--ui-text-sm); border-radius: var(--ui-radius-sm); }
	.toggle.md { height: 32px; padding: 0 14px; font-size: var(--ui-text-md); }
	.toggle.lg { height: 40px; padding: 0 18px; font-size: var(--ui-text-lg); border-radius: var(--ui-radius-lg); }
	.toggle.off { opacity: 0.5; cursor: not-allowed; }

	.toggle.outline { background-color: #00000000; border-color: var(--ui-border-strong); }
	.toggle.ghost { background-color: #00000000; }
	.toggle.on.idle:hover { background-color: var(--ui-raised); color: var(--ui-ink); }

	.toggle.pressed.accent { background-color: var(--ui-accent-soft); color: var(--ui-accent); }
	.toggle.pressed.danger { background-color: var(--ui-danger-soft); color: var(--ui-danger); }
	.toggle.pressed.success { background-color: var(--ui-success-soft); color: var(--ui-success); }
	.toggle.pressed.warn { background-color: var(--ui-warn-soft); color: var(--ui-warn); }
	.toggle.pressed.neutral { background-color: var(--ui-raised); color: var(--ui-ink); }

	.toggle.focused { border-color: var(--ui-ring); }
	.toggle.j-first { border-top-right-radius: 0; border-bottom-right-radius: 0; }
	.toggle.j-middle { border-radius: 0; margin-left: -1px; }
	.toggle.j-last { border-top-left-radius: 0; border-bottom-left-radius: 0; margin-left: -1px; }
</style>
