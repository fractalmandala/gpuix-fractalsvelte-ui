<script lang="ts">
	import { get_native, type GpuixEvent, type ShadowNode } from 'gpuix-fractalsvelte';
	import Portal from 'gpuix-fractalsvelte/components/Portal.svelte';

	let {
		value,
		onchange = undefined,
		min = 0,
		max = 100,
		step = 1,
		size = 'h-md',
		disabled = false,
		style = null,
		testid = null
	}: {
		value: number;
		onchange?: (value: number) => void;
		min?: number;
		max?: number;
		/** Values snap to `min + n * step`. */
		step?: number;
		/** Fractalstyler's height steps for the control. */
		size?: 'h-sm' | 'h-md' | 'h-bs';
		disabled?: boolean;
		style?: string | null;
		testid?: string | null;
	} = $props();

	let root: ShadowNode | null = null;
	let track: ShadowNode | null = null;
	let focused = $state(false);
	let dragging = $state(false);

	const clamp = (v: number) => Math.min(max, Math.max(min, v));
	const fraction = $derived(max > min ? (clamp(value) - min) / (max - min) : 0);

	function set(raw: number) {
		const next = Number(clamp(min + Math.round((raw - min) / step) * step).toFixed(10));
		if (!disabled && next !== value) onchange?.(next);
	}

	// Measured on the track, not the root: the root's hit area is wider than the track.
	function set_from_x(x: number) {
		const box = track?.nativeId == null ? null : get_native()?.getElementBounds(track.nativeId);
		if (!box || box.width <= 0) return;
		const f = Math.min(1, Math.max(0, (x - box.x) / box.width));
		set(min + f * (max - min));
	}

	function press(e: GpuixEvent) {
		if (disabled || e.button !== 0) return;
		if (root?.nativeId != null) get_native()?.focusElement(root.nativeId);
		dragging = true;
		set_from_x(e.x!);
	}

	// GPUI does not capture the pointer, so the drag runs on a window-sized cover. A move with no
	// button held means the release landed outside the window.
	function drag_move(e: GpuixEvent) {
		if (e.pressedButton == null) dragging = false;
		else set_from_x(e.x!);
	}

	function key(e: GpuixEvent) {
		if (e.key === 'right' || e.key === 'up') set(value + step);
		else if (e.key === 'left' || e.key === 'down') set(value - step);
		else if (e.key === 'home') set(min);
		else if (e.key === 'end') set(max);
	}
</script>

<div
	class="root {size}"
	class:on={!disabled}
	class:off={disabled}
	class:focused
	tabindex={disabled ? -1 : 0}
	hitbox="self"
	onmousedown={press}
	onkeydown={key}
	onfocus={() => (focused = true)}
	onblur={() => (focused = false)}
	{@attach (node: ShadowNode) => (root = node)}
	{style}
	testId={testid}
>
	<div class="track" {@attach (node: ShadowNode) => (track = node)} testId={testid && `${testid}-track`}>
		<div class="fill" style:width="{fraction * 100}%">
			<div class="thumb {size}" class:focused testId={testid && `${testid}-thumb`}></div>
		</div>
	</div>
</div>

{#if dragging}
	<Portal>
		<div class="cover" onmousemove={drag_move} onmouseup={() => (dragging = false)} testId={testid && `${testid}-cover`}></div>
	</Portal>
{/if}

<style>
	.root {
		display: flex;
		flex-direction: row;
		align-items: center;
		width: 240px;
		min-width: 120px;
		user-select: none;
	}
	.root.h-sm { height: var(--height-sm); }
	.root.h-md { height: var(--height-md); }
	.root.h-bs { height: var(--height-bs); }
	.root.on { cursor: pointer; }
	.root.off { opacity: 0.5; cursor: not-allowed; }

	.track {
		flex-grow: 1;
		height: 4px;
		margin: 0 10px;
		background-color: var(--bg-raised);
		border-radius: var(--radius-full);
	}

	.fill {
		position: relative;
		height: 100%;
		background-color: var(--theme-color);
		border-radius: var(--radius-full);
	}

	.thumb {
		position: absolute;
		border-width: 2px;
		border-color: var(--theme-color);
		border-radius: var(--radius-full);
		background-color: var(--bg-surface);
	}
	.thumb.h-sm { width: var(--height-sm); height: var(--height-sm); right: -8px; top: -6px; }
	.thumb.h-md { width: var(--height-md); height: var(--height-md); right: -10px; top: -8px; }
	.thumb.h-bs { width: var(--height-bs); height: var(--height-bs); right: -12px; top: -10px; }
	.thumb.focused { border-color: var(--ring); background-color: var(--theme-color-sub); }

	.cover { position: absolute; inset: 0; cursor: pointer; }
</style>
