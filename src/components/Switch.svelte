<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { GpuixEvent } from 'gpuix-fractalsvelte';
	import type { Size } from '../types.ts';

	let {
		checked = false,
		onchange = undefined,
		label = '',
		children = undefined,
		disabled = false,
		size = 'md',
		style = null,
		testid = null
	}: {
		checked?: boolean;
		/** Called with the next state when the track or label is clicked, or Space is pressed. */
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
	role="switch"
	aria-label={label || null}
	onclick={toggle}
	onkeydown={key}
	onfocus={() => (focused = true)}
	onblur={() => (focused = false)}
	{style}
	testId={testid}
>
	<div class="track {size}" class:lit={checked} class:focused testId={testid && `${testid}-track`}>
		<div class="thumb {size}" class:lit={checked} testId={testid && `${testid}-thumb`}></div>
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
	.track {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: start;
		flex-shrink: 0;
		padding: 1px;
		border-width: 1px;
		border-color: #00000000;
		border-radius: var(--ui-radius-full);
		background-color: var(--ui-border-strong);
	}
	.track.sm { width: 28px; height: 16px; }
	.track.md { width: 36px; height: 20px; }
	.track.lg { width: 44px; height: 24px; }
	.track.lit { background-color: var(--ui-accent); justify-content: end; }
	.track.focused { border-color: var(--ui-ring); }
	.thumb { border-radius: var(--ui-radius-full); background-color: var(--ui-surface); }
	.thumb.sm { width: 12px; height: 12px; }
	.thumb.md { width: 16px; height: 16px; }
	.thumb.lg { width: 20px; height: 20px; }
	.thumb.lit { background-color: var(--ui-accent-ink); }
	.text { font-size: var(--ui-text-md); color: var(--ui-ink); }
	.text.sm { font-size: var(--ui-text-sm); }
	.text.lg { font-size: var(--ui-text-lg); }
</style>
