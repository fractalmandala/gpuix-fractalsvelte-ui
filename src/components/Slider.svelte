<script lang="ts">
	import { get_native, type GpuixEvent, type ShadowNode } from 'gpuix-fractalsvelte';
	import Portal from 'gpuix-fractalsvelte/components/Portal.svelte';
	import type { Size } from '../types.ts';

	let {
		value,
		onchange = undefined,
		min = 0,
		max = 100,
		step = 1,
		size = 'md',
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
		size?: Size;
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
	<div class="track {size}" {@attach (node: ShadowNode) => (track = node)} testId={testid && `${testid}-track`}>
		<div class="fill {size}" style:width="{fraction * 100}%">
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
	.root.sm { height: 18px; }
	.root.md { height: 22px; }
	.root.lg { height: 26px; }
	.root.on { cursor: pointer; }
	.root.off { opacity: 0.5; cursor: not-allowed; }

	.track {
		flex-grow: 1;
		margin: 0 10px;
		background-color: var(--ui-raised);
		border-radius: var(--ui-radius-full);
	}
	.track.sm { height: 4px; }
	.track.md { height: 4px; }
	.track.lg { height: 6px; }

	.fill {
		position: relative;
		height: 100%;
		background-color: var(--ui-accent);
		border-radius: var(--ui-radius-full);
	}

	.thumb {
		position: absolute;
		border-width: 2px;
		border-color: var(--ui-accent);
		border-radius: var(--ui-radius-full);
		background-color: var(--ui-surface);
	}
	.thumb.sm { width: 12px; height: 12px; right: -6px; top: -4px; }
	.thumb.md { width: 16px; height: 16px; right: -8px; top: -6px; }
	.thumb.lg { width: 20px; height: 20px; right: -10px; top: -7px; }
	.thumb.focused { border-color: var(--ui-ring); background-color: var(--ui-accent-soft); }

	.cover { position: absolute; inset: 0; cursor: pointer; }
</style>
