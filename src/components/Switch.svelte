<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { GpuixEvent } from 'gpuix-fractalsvelte';

	let {
		checked = false,
		onchange = undefined,
		label = '',
		children = undefined,
		disabled = false,
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
	class="row"
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
	<div class="track" class:lit={checked} class:focused testId={testid && `${testid}-track`}>
		<div class="thumb" class:lit={checked} testId={testid && `${testid}-thumb`}></div>
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
	.track {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: start;
		flex-shrink: 0;
		padding: 1px;
		border-width: 1px;
		border-color: #00000000;
		border-radius: var(--radius-full);
		background-color: var(--border-strong);
		width: var(--switch-w);
		height: var(--switch-h);
	}
	.track.lit { background-color: var(--theme-color); justify-content: end; }
	.track.focused { border-color: var(--ring); }
	.thumb { width: var(--switch-thumb); height: var(--switch-thumb); border-radius: var(--radius-full); background-color: var(--bg-surface); }
	.thumb.lit { background-color: var(--text-theme); }
	.text { font-size: var(--text-md); color: var(--text-primary); }
</style>
