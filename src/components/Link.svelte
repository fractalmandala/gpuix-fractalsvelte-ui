<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { GpuixEvent } from 'gpuix-fractalsvelte';
	import type { Size, Tone } from '../types.ts';

	let {
		children = undefined,
		label = '',
		tone = 'accent',
		size = 'md',
		disabled = false,
		onclick = undefined,
		style = null,
		testid = null
	}: {
		children?: Snippet;
		label?: string;
		/** Text colour role; `neutral` is plain ink. */
		tone?: Tone;
		size?: Size;
		disabled?: boolean;
		onclick?: (e: GpuixEvent) => void;
		style?: string | null;
		testid?: string | null;
	} = $props();

	let focused = $state(false);
	const live = $derived(!disabled);

	function activate(e: GpuixEvent) {
		if (live) onclick?.(e);
	}

	function key(e: GpuixEvent) {
		if (e.key === 'enter' || e.key === 'space') activate(e);
	}
</script>

<div
	class="link {tone} {size}"
	class:on={live}
	class:off={!live}
	class:focused
	tabindex={disabled ? -1 : 0}
	onclick={activate}
	onkeydown={key}
	onfocus={() => (focused = true)}
	onblur={() => (focused = false)}
	{style}
	testId={testid}
>
	{#if children}{@render children()}{:else}{label}{/if}
</div>

<style>
	.link {
		align-self: flex-start;
		border-width: 1px;
		border-color: #00000000;
		border-radius: var(--ui-radius-sm);
		padding: 0 2px;
		font-weight: 500;
		text-decoration: none;
		user-select: none;
		cursor: pointer;
	}
	.link.sm { font-size: var(--ui-text-sm); }
	.link.md { font-size: var(--ui-text-md); }
	.link.lg { font-size: var(--ui-text-lg); }
	.link.off { opacity: 0.5; cursor: not-allowed; }

	.link.accent { color: var(--ui-accent); }
	.link.danger { color: var(--ui-danger); }
	.link.success { color: var(--ui-success); }
	.link.warn { color: var(--ui-warn); }
	.link.neutral { color: var(--ui-ink); }

	.link.on:hover { text-decoration: underline; }
	.link.on.accent:hover { color: var(--ui-accent-hover); }
	.link.on.danger:hover { color: var(--ui-danger-hover); }

	.link.focused { border-color: var(--ui-ring); }
</style>
