<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { GpuixEvent } from 'gpuix-fractalsvelte';
	import type { Size } from '../types.ts';

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
		size = 'md',
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
		size?: Size;
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
	<div class="box {size}" class:lit class:focused testId={testid && `${testid}-box`}>
		{#if mark}<svg source={mark} class="mark {size}"></svg>{/if}
	</div>
	{#if children}
		<div class="text {size}">{@render children()}</div>
	{:else if label}
		<div class="text {size}">{label}</div>
	{/if}
</div>

<style>
	.row {
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: 8px;
	}
	.row.sm { gap: 6px; }
	.row.on { cursor: pointer; }
	.row.off { cursor: not-allowed; opacity: 0.5; }
	.box {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		width: 16px;
		height: 16px;
		border-width: 1px;
		border-color: var(--ui-border-strong);
		border-radius: 4px;
		background-color: var(--ui-surface);
	}
	.box.sm { width: 14px; height: 14px; border-radius: 3px; }
	.box.lg { width: 20px; height: 20px; border-radius: 5px; }
	.box.lit { background-color: var(--ui-accent); border-color: var(--ui-accent); }
	.box.focused { border-color: var(--ui-ring); }
	.mark { width: 12px; height: 12px; color: var(--ui-accent-ink); }
	.mark.sm { width: 10px; height: 10px; }
	.mark.lg { width: 14px; height: 14px; }
	.text { font-size: var(--ui-text-md); color: var(--ui-ink); }
	.text.sm { font-size: var(--ui-text-sm); }
	.text.lg { font-size: var(--ui-text-lg); }
</style>
