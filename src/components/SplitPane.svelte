<script lang="ts">
	import type { Snippet } from 'svelte';
	import { untrack } from 'svelte';
	import { get_native, type GpuixEvent, type ShadowNode } from 'gpuix-fractalsvelte';

	const GRIP = 9;
	const NUDGE = 10;

	let {
		first,
		second,
		direction = 'row',
		initial = 240,
		minFirst = 80,
		minSecond = 80,
		onresize = undefined,
		style = null,
		testid = null
	}: {
		first: Snippet;
		second: Snippet;
		/** `row` puts the panes side by side; `column` stacks them. */
		direction?: 'row' | 'column';
		/** First pane's size in px at mount. */
		initial?: number;
		minFirst?: number;
		minSecond?: number;
		/** Called with the first pane's size in px while it is dragged or nudged with the arrow keys. */
		onresize?: (size: number) => void;
		style?: string | null;
		testid?: string | null;
	} = $props();

	let size = $state(untrack(() => initial));
	let root: ShadowNode | null = null;
	let drag = $state<{ at: number; start: number } | null>(null);
	let focused = $state(false);
	const horizontal = $derived(direction === 'row');
	const lit = $derived(focused || drag !== null);
	const first_css = $derived(horizontal ? `width: ${size}px` : `height: ${size}px`);

	function clamp(v: number) {
		const box = root?.nativeId == null ? null : get_native()?.getElementBounds(root.nativeId);
		const total = box ? (horizontal ? box.width : box.height) : Infinity;
		return Math.max(minFirst, Math.min(v, total - GRIP - minSecond));
	}

	function resize(next: number) {
		size = next;
		onresize?.(next);
	}

	function grab(e: GpuixEvent) {
		if (e.button !== 0) return;
		drag = { at: horizontal ? e.x! : e.y!, start: size };
	}

	// GPUI does not capture the pointer, so the drag runs on an overlay over the whole split, and a
	// move with no button held means the release landed elsewhere.
	function move(e: GpuixEvent) {
		if (drag === null) return;
		if (e.pressedButton == null) {
			drag = null;
			return;
		}
		resize(clamp(drag.start + (horizontal ? e.x! : e.y!) - drag.at));
	}

	function key(e: GpuixEvent) {
		if (e.key === (horizontal ? 'left' : 'up')) resize(clamp(size - NUDGE));
		else if (e.key === (horizontal ? 'right' : 'down')) resize(clamp(size + NUDGE));
	}
</script>

<div
	class="split {direction}"
	{style}
	{@attach (node: ShadowNode) => (root = node)}
	testId={testid}
>
	<div class="pane lead" style={first_css}>{@render first()}</div>
	<div
		class="grip {direction}"
		hitbox="self"
		tabindex={0}
		onmousedown={grab}
		onkeydown={key}
		onfocus={() => (focused = true)}
		onblur={() => (focused = false)}
		testId={testid && `${testid}-divider`}
	>
		<div class="line {direction}" class:focused={lit}></div>
	</div>
	<div class="pane rest">{@render second()}</div>
	{#if drag !== null}
		<div class="overlay" onmousemove={move} onmouseup={() => (drag = null)}></div>
	{/if}
</div>

<style>
	.split { display: flex; flex-direction: row; position: relative; flex-grow: 1; min-width: 0; min-height: 0; }
	.split.column { flex-direction: column; }
	.pane { display: flex; flex-direction: column; min-width: 0; min-height: 0; overflow: hidden; }
	.pane.lead { flex-shrink: 0; }
	.pane.rest { flex-grow: 1; }
	.grip { display: flex; flex-direction: row; align-self: stretch; flex-shrink: 0; padding: 0 4px; cursor: col-resize; }
	.grip.column { flex-direction: column; padding: 4px 0; cursor: row-resize; }
	.line { background-color: var(--ui-border); }
	.line.row { width: 1px; align-self: stretch; }
	.line.column { height: 1px; align-self: stretch; }
	.line.focused { background-color: var(--ui-ring); }
	.overlay { position: absolute; inset: 0; }
</style>
