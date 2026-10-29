<script lang="ts">
	import type { Snippet } from 'svelte';
	import { focus_element, type GpuixEvent, type ShadowNode } from 'gpuix-fractalsvelte';
	import type { Size } from '../types.ts';

	type Item = { id: string; label: string; icon?: Snippet; badge?: string; disabled?: boolean };

	let {
		sections,
		value,
		onchange = undefined,
		size = 'md',
		style = null,
		testid = null
	}: {
		sections: { title?: string; items: Item[] }[];
		/** The active item's id. */
		value: string;
		onchange?: (id: string) => void;
		size?: Size;
		style?: string | null;
		testid?: string | null;
	} = $props();

	const nodes: Record<string, ShadowNode> = {};
	const flat = $derived(sections.flatMap((s) => s.items));
	let focused = $state<string | null>(null);

	function pick(item: Item) {
		if (!item.disabled && item.id !== value) onchange?.(item.id);
	}

	// Up and down select and focus the next enabled item, wrapping past the last one.
	function step(id: string, dir: 1 | -1) {
		const live = flat.filter((item) => !item.disabled);
		const at = live.findIndex((item) => item.id === id);
		const next = live[(at + dir + live.length) % live.length];
		if (!next) return;
		pick(next);
		focus_element(nodes[next.id]);
	}

	function key(e: GpuixEvent, id: string) {
		if (e.key === 'up') step(id, -1);
		else if (e.key === 'down') step(id, 1);
		else if (e.key === 'enter' || e.key === 'space') pick(flat.find((item) => item.id === id)!);
	}
</script>

<div class="nav {size}" {style} testId={testid}>
	{#each sections as section, i (i)}
		<div class="section">
			{#if section.title}<div class="heading">{section.title}</div>{/if}
			{#each section.items as item (item.id)}
				{@const active = item.id === value}
				<div
					class="item {size}"
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
					{#if item.icon}<div class="icon">{@render item.icon()}</div>{/if}
					<div class="label">{item.label}</div>
					{#if item.badge}<div class="badge">{item.badge}</div>{/if}
				</div>
			{/each}
		</div>
	{/each}
</div>

<style>
	.nav { display: flex; flex-direction: column; gap: 12px; }
	.section { display: flex; flex-direction: column; gap: 2px; }
	.heading { padding: 0 10px 4px 10px; font-size: var(--ui-text-xs); font-weight: 600; color: var(--ui-ink-faint); white-space: nowrap; }

	.item {
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: 8px;
		padding: 0 10px;
		border-width: 1px;
		border-color: #00000000;
		border-radius: var(--ui-radius-md);
		background-color: #00000000;
		color: var(--ui-ink-muted);
		font-weight: 500;
		white-space: nowrap;
		user-select: none;
		cursor: pointer;
	}
	.item.sm { height: 26px; font-size: var(--ui-text-sm); }
	.item.md { height: 32px; font-size: var(--ui-text-md); }
	.item.lg { height: 40px; font-size: var(--ui-text-lg); }
	.item.active { background-color: var(--ui-accent-soft); color: var(--ui-accent); }
	.item.rest:hover { background-color: var(--ui-raised); color: var(--ui-ink); }
	.item.off { opacity: 0.5; cursor: not-allowed; }
	.item.focused { border-color: var(--ui-ring); }

	.icon { display: flex; flex-direction: row; align-items: center; justify-content: center; width: 16px; }
	.label { display: flex; flex-grow: 1; }
	.badge {
		height: 16px;
		padding: 0 6px;
		border-radius: var(--ui-radius-full);
		background-color: var(--ui-raised);
		color: var(--ui-ink-muted);
		font-size: var(--ui-text-xs);
		line-height: 16px;
	}
</style>
