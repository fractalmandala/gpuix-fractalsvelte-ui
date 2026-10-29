<script lang="ts">
	import { get_native, type GpuixEvent, type ShadowNode } from 'gpuix-fractalsvelte';
	import type { Size } from '../types.ts';

	type Option = { value: string; label: string; disabled?: boolean };

	let {
		options,
		value = null,
		onchange = undefined,
		direction = 'column',
		size = 'md',
		disabled = false,
		style = null,
		testid = null
	}: {
		options: Option[];
		/** The checked option's value, or `null` for none. */
		value?: string | null;
		onchange?: (value: string) => void;
		direction?: 'row' | 'column';
		size?: Size;
		disabled?: boolean;
		style?: string | null;
		testid?: string | null;
	} = $props();

	const nodes: (ShadowNode | undefined)[] = [];
	let focused = $state(-1);

	const checked = $derived(options.findIndex((o) => o.value === value));
	const enabled = (i: number) => !disabled && !options[i].disabled;
	// The window helpers are no-ops headless, and the native call is what they make anyway.
	const focus_node = (node?: ShadowNode) => {
		if (node?.nativeId != null) get_native()?.focusElement(node.nativeId);
	};

	function pick(i: number) {
		if (!enabled(i) || i === checked) return;
		onchange?.(options[i].value);
	}

	// Arrows select as they move, and wrap; disabled options are skipped.
	function move(from: number, dir: 1 | -1) {
		const n = options.length;
		for (let step = 1; step < n; step++) {
			const i = (from + dir * step + n) % n;
			if (enabled(i)) {
				focus_node(nodes[i]);
				pick(i);
				return;
			}
		}
	}

	function key(i: number, e: GpuixEvent) {
		if (e.key === 'down' || e.key === 'right') move(i, 1);
		else if (e.key === 'up' || e.key === 'left') move(i, -1);
		else if (e.key === 'space') pick(i);
	}
</script>

<div class="group {direction}" {style} testId={testid}>
	{#each options as opt, i (opt.value)}
		<div
			class="opt {size}"
			class:on={enabled(i)}
			class:off={!enabled(i)}
			tabindex={enabled(i) ? 0 : -1}
			onclick={() => pick(i)}
			onkeydown={(e) => key(i, e)}
			onfocus={() => (focused = i)}
			onblur={() => (focused = -1)}
			{@attach (node: ShadowNode) => (nodes[i] = node)}
			testId={testid && `${testid}-${opt.value}`}
		>
			<div class="circle {size}" class:checked={i === checked} class:focused={focused === i}>
				{#if i === checked}<div class="dot {size}"></div>{/if}
			</div>
			<div class="label {size}">{opt.label}</div>
		</div>
	{/each}
</div>

<style>
	.group { display: flex; }
	.group.column { flex-direction: column; gap: 4px; }
	.group.row { flex-direction: row; gap: 16px; }

	.opt {
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: 8px;
		user-select: none;
	}
	.opt.on { cursor: pointer; }
	.opt.off { opacity: 0.5; cursor: not-allowed; }
	.opt.sm { height: 22px; }
	.opt.md { height: 28px; }
	.opt.lg { height: 34px; }

	.circle {
		display: flex;
		align-items: center;
		justify-content: center;
		border-width: 1px;
		border-color: var(--ui-border-strong);
		border-radius: var(--ui-radius-full);
		background-color: var(--ui-surface);
	}
	.circle.sm { width: 14px; height: 14px; }
	.circle.md { width: 16px; height: 16px; }
	.circle.lg { width: 18px; height: 18px; }
	.circle.checked { border-color: var(--ui-accent); }
	.circle.focused { border-color: var(--ui-ring); }

	.dot { border-radius: var(--ui-radius-full); background-color: var(--ui-accent); }
	.dot.sm { width: 6px; height: 6px; }
	.dot.md { width: 8px; height: 8px; }
	.dot.lg { width: 10px; height: 10px; }

	.label { color: var(--ui-ink); }
	.label.sm { font-size: var(--ui-text-sm); }
	.label.md { font-size: var(--ui-text-md); }
	.label.lg { font-size: var(--ui-text-lg); }
</style>
