<script lang="ts">
	import type { Snippet } from 'svelte';
	import { focus_element, type GpuixEvent, type ShadowNode } from 'gpuix-fractalsvelte';
	import type { Size } from '../types.ts';

	let {
		items,
		value,
		onchange = undefined,
		variant = 'line',
		size = 'md',
		children = undefined,
		style = null,
		testid = null
	}: {
		items: { id: string; label: string; disabled?: boolean }[];
		/** The active tab's id. */
		value: string;
		onchange?: (id: string) => void;
		/** `line` underlines the active tab; `pill` is a segmented control. */
		variant?: 'line' | 'pill';
		size?: Size;
		/** The panel under the tabs, given the active id. */
		children?: Snippet<[string]>;
		style?: string | null;
		testid?: string | null;
	} = $props();

	const nodes: Record<string, ShadowNode> = {};
	let focused = $state<string | null>(null);

	function select(id: string) {
		if (id !== value) onchange?.(id);
	}

	function pick(item: (typeof items)[number]) {
		if (!item.disabled) select(item.id);
	}

	// Arrows select and focus the next enabled tab, so the keyboard reaches what a click would.
	function step(id: string, dir: 1 | -1) {
		const live = items.filter((item) => !item.disabled);
		const at = live.findIndex((item) => item.id === id);
		const next = live[(at + dir + live.length) % live.length];
		if (!next) return;
		select(next.id);
		focus_element(nodes[next.id]);
	}

	function key(e: GpuixEvent, id: string) {
		if (e.key === 'left') step(id, -1);
		else if (e.key === 'right') step(id, 1);
		else if (e.key === 'enter' || e.key === 'space') select(id);
	}
</script>

<div class="tabs" {style} testId={testid}>
	<div class="list {variant}">
		{#each items as item (item.id)}
			{@const active = item.id === value}
			<div
				class="tab {variant} {size}"
				class:active
				class:off={item.disabled}
				class:rest={!active && !item.disabled}
				class:focused={focused === item.id}
				tabindex={active ? 0 : -1}
				{@attach (node: ShadowNode) => (nodes[item.id] = node)}
				onclick={() => pick(item)}
				onkeydown={(e: GpuixEvent) => key(e, item.id)}
				onfocus={() => (focused = item.id)}
				onblur={() => (focused = null)}
				testId={testid && `${testid}-${item.id}`}
			>
				<div class="label">{item.label}</div>
				{#if variant === 'line'}<div class="bar" class:lit={active}></div>{/if}
			</div>
		{/each}
	</div>
	{#if children}<div class="panel">{@render children(value)}</div>{/if}
</div>

<style>
	.tabs { display: flex; flex-direction: column; gap: 12px; }
	.list { display: flex; flex-direction: row; }
	.list.line { border-bottom-width: 1px; border-color: var(--ui-border); }
	.list.pill { align-self: start; gap: 2px; padding: 3px; border-radius: var(--ui-radius-md); background-color: var(--ui-raised); }

	.tab {
		display: flex;
		flex-direction: column;
		border-width: 1px;
		border-color: #00000000;
		background-color: #00000000;
		color: var(--ui-ink-muted);
		font-weight: 500;
		white-space: nowrap;
		user-select: none;
		cursor: pointer;
	}
	.tab.sm { height: 26px; font-size: var(--ui-text-sm); border-radius: var(--ui-radius-sm); }
	.tab.md { height: 32px; font-size: var(--ui-text-md); border-radius: var(--ui-radius-sm); }
	.tab.lg { height: 40px; font-size: var(--ui-text-lg); border-radius: var(--ui-radius-md); }
	.tab.active { color: var(--ui-ink); }
	.tab.rest:hover { color: var(--ui-ink); }
	.tab.pill.active { background-color: var(--ui-surface); }
	.tab.off { opacity: 0.5; cursor: not-allowed; }
	.tab.focused { border-color: var(--ui-ring); }

	.label { display: flex; flex-direction: row; flex-grow: 1; align-items: center; justify-content: center; padding: 0 12px; }
	.bar { height: 2px; background-color: #00000000; }
	.bar.lit { background-color: var(--ui-accent); }

	.panel { display: flex; flex-direction: column; }
</style>
