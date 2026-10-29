<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { GpuixEvent } from 'gpuix-fractalsvelte';

	const CHECK =
		'<svg viewBox="0 0 16 16"><path d="M3.5 8.5l3 3 6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
	const DASH = '<svg viewBox="0 0 16 16"><path d="M4 8h8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';

	let {
		checked = false,
		indeterminate = false,
		onchange = undefined,
		label = '',
		children = undefined,
		disabled = false,
		size = 'h-sm',
		style = null,
		testid = null
	}: {
		checked?: boolean;
		/** Shows a dash in place of the tick. The parent decides what a click means, and clears it. */
		indeterminate?: boolean;
		/** Called with the next checked state when the box or label is clicked, or Space is pressed. */
		onchange?: (checked: boolean) => void;
		/** Plain-text label, ignored when `children` is given. */
		label?: string;
		children?: Snippet;
		disabled?: boolean;
		/** Fractalstyler's height steps; the box is that height square. */
		size?: 'h-sm' | 'h-md' | 'h-bs';
		style?: string | null;
		testid?: string | null;
	} = $props();

	let focused = $state(false);
	const lit = $derived(checked || indeterminate);
	const mark = $derived(indeterminate ? DASH : checked ? CHECK : '');

	function toggle() {
		if (!disabled) onchange?.(!checked);
	}

	function key(e: GpuixEvent) {
		if (e.key === 'space') toggle();
	}
</script>

<div
	class="row {size}"
	class:on={!disabled}
	class:off={disabled}
	tabindex={disabled ? -1 : 0}
	hitbox="self"
	role="checkbox"
	aria-label={label || null}
	onclick={toggle}
	onkeydown={key}
	onfocus={() => (focused = true)}
	onblur={() => (focused = false)}
	{style}
	testId={testid}
>
	<div class="box box-{size}" class:lit class:focused testId={testid && `${testid}-box`}>
		{#if mark}<svg source={mark} class="mark"></svg>{/if}
	</div>
	{#if children}
		<div class="text">{@render children()}</div>
	{:else if label}
		<div class="text">{label}</div>
	{/if}
</div>

<style>
	.row {
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: 8px;
	}
	.row.on { cursor: pointer; }
	.row.off { cursor: not-allowed; opacity: 0.5; }
	.box {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		border-width: 1px;
		border-color: var(--border-strong);
		border-radius: var(--radius-sm);
		background-color: var(--bg-surface);
	}
	.box.lit { background-color: var(--theme-color); border-color: var(--theme-color); }
	.box.focused { border-color: var(--ring); }
	.mark { width: 12px; height: 12px; color: var(--text-theme); }
	.text { font-size: var(--text-md); color: var(--text-primary); }
</style>
