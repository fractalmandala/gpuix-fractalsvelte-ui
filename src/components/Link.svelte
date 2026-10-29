<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { GpuixEvent } from 'gpuix-fractalsvelte';

	let {
		children = undefined,
		label = '',
		variant = 'themed',
		size = 'h-bs',
		disabled = false,
		onclick = undefined,
		style = null,
		testid = null
	}: {
		children?: Snippet;
		label?: string;
		/** Text colour, in fractalstyler's names; `secondary` is plain ink. */
		variant?: 'themed' | 'secondary' | 'info' | 'success' | 'warning' | 'danger';
		size?: 'h-sm' | 'h-md' | 'h-bs' | 'h-lg' | 'h-xl';
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
	class="link el-size {variant} {size}"
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
		border-radius: var(--radius-sm);
		padding: 0 2px;
		font-weight: 500;
		text-decoration: none;
		user-select: none;
		cursor: pointer;
	}
	.link.off { opacity: 0.5; cursor: not-allowed; }

	.link.themed { color: var(--theme-color); }
	.link.danger { color: var(--danger); }
	.link.success { color: var(--success); }
	.link.warning { color: var(--warning); }
	.link.info { color: var(--info); }
	.link.secondary { color: var(--text-primary); }

	.link.on:hover { text-decoration: underline; }
	.link.on.themed:hover { color: var(--theme-color-alt); }
	.link.on.danger:hover { color: var(--danger-hover); }

	.link.focused { border-color: var(--ring); }
</style>
