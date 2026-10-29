<script lang="ts">
	import { get_native, type GpuixEvent, type ShadowNode } from 'gpuix-fractalsvelte';

	type Option = { value: string; label: string; disabled?: boolean };

	let {
		options,
		value = null,
		onchange = undefined,
		direction = 'column',
		size = 'h-sm',
		disabled = false,
		style = null,
		testid = null
	}: {
		options: Option[];
		/** The checked option's value, or `null` for none. */
		value?: string | null;
		onchange?: (value: string) => void;
		direction?: 'row' | 'column';
		/** Fractalstyler's height steps; each circle is that height square. */
		size?: 'h-sm' | 'h-md' | 'h-bs';
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
			class="opt"
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
			<div class="circle box-{size}" class:checked={i === checked} class:focused={focused === i}>
				{#if i === checked}<div class="dot"></div>{/if}
			</div>
			<div class="label">{opt.label}</div>
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

	.circle {
		display: flex;
		align-items: center;
		justify-content: center;
		border-width: 1px;
		border-color: var(--border-strong);
		border-radius: var(--radius-full);
		background-color: var(--bg-surface);
	}
	.circle.checked { border-color: var(--theme-color); }
	.circle.focused { border-color: var(--ring); }

	.dot { width: 40%; height: 40%; border-radius: var(--radius-full); background-color: var(--theme-color); }

	.label { color: var(--text-primary); font-size: var(--text-md); }
</style>
