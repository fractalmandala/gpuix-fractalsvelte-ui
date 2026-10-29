<script lang="ts">
	import type { Snippet } from 'svelte';
	import { on_window_key, type GpuixEvent } from 'gpuix-fractalsvelte';
	import Popover from 'gpuix-fractalsvelte/components/Popover.svelte';

	type Entry =
		| { label: string; shortcut?: string; variant?: 'secondary' | 'themed' | 'info' | 'success' | 'warning' | 'danger'; disabled?: boolean; onselect: () => void }
		| { separator: true };

	let {
		items,
		trigger,
		open = false,
		onopenchange = undefined,
		side = 'bottom',
		align = 'start',
		style = null,
		testid = null
	}: {
		items: Entry[];
		/** The trigger's content. Keep it free of its own `onclick`, or the trigger's click never reaches the menu. */
		trigger: Snippet;
		open?: boolean;
		onopenchange?: (open: boolean) => void;
		side?: 'top' | 'bottom';
		align?: 'start' | 'center' | 'end';
		/** Inline CSS for the panel, e.g. `min-width: 220px`. */
		style?: string | null;
		testid?: string | null;
	} = $props();

	const panel = $derived(
		`background-color: var(--bg-sunken); color: var(--text-primary); border-color: var(--border); border-radius: var(--radius-md); padding: 4px; min-width: 200px; ${style ?? ''}`
	);

	let active = $state(-1);
	let focused = $state(false);

	const selectable = (entry: Entry | undefined): entry is Extract<Entry, { onselect: unknown }> =>
		!!entry && !('separator' in entry) && !entry.disabled;

	// Steps from `from` to the next selectable entry in `dir`, wrapping; from -1, Down lands on the first.
	function next(from: number, dir: 1 | -1) {
		const n = items.length;
		let i = from < 0 ? (dir > 0 ? -1 : n) : from;
		for (let k = 0; k < n; k++) {
			i = (i + dir + n) % n;
			if (selectable(items[i])) return i;
		}
		return from;
	}

	function show(value: boolean) {
		if (value) active = next(-1, 1);
		onopenchange?.(value);
	}

	function choose(entry: Entry) {
		if (!selectable(entry)) return;
		show(false);
		entry.onselect();
	}

	function key(e: GpuixEvent) {
		if (!open && (e.key === 'enter' || e.key === 'space' || e.key === 'down')) show(true);
	}

	$effect(() => {
		if (!open) return;
		return on_window_key('keydown', (e) => {
			if (e.key === 'down') active = next(active, 1);
			else if (e.key === 'up') active = next(active, -1);
			else if (e.key === 'enter' && active >= 0) choose(items[active]);
		});
	});
</script>

<Popover {open} onclose={() => show(false)} {side} {align} gap={4} style={panel} testid={testid}>
	<div class="trigger" class:focused tabindex={0} onclick={() => show(!open)} onkeydown={key} onfocus={() => (focused = true)} onblur={() => (focused = false)} testId={testid && `${testid}-trigger`}>
		{@render trigger()}
	</div>
	{#snippet content()}
		<div class="menu">
			{#each items as entry, i (i)}
				{#if 'separator' in entry}
					<div class="sep"></div>
				{:else}
					{@const variant = entry.variant ?? 'secondary'}
					<div
						class="item {variant}"
						class:hl={i === active}
						class:off={entry.disabled}
						onmouseenter={() => { if (selectable(entry)) active = i; }}
						onclick={() => choose(entry)}
					>
						<div class="label">{entry.label}</div>
						{#if entry.shortcut}<div class="shortcut">{entry.shortcut}</div>{/if}
					</div>
				{/if}
			{/each}
		</div>
	{/snippet}
</Popover>

<style>
	.trigger { display: flex; border-width: 1px; border-color: #00000000; border-radius: var(--radius-md); }
	.trigger.focused { border-color: var(--ring); }

	.menu { display: flex; flex-direction: column; }
	.item {
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: 16px;
		height: 28px;
		padding: 0 10px;
		border-radius: var(--radius-sm);
		font-size: var(--text-md);
		white-space: nowrap;
		user-select: none;
		cursor: pointer;
	}
	.item.secondary { color: var(--text-primary); }
	.item.themed { color: var(--theme-color); }
	.item.info { color: var(--info); }
	.item.success { color: var(--success); }
	.item.warning { color: var(--warning); }
	.item.danger { color: var(--danger); }
	.item.hl { background-color: var(--bg-raised); }
	.item.danger.hl { background-color: var(--danger-soft); }
	.item.off { opacity: 0.5; cursor: not-allowed; }
	.label { display: flex; flex-grow: 1; }
	.shortcut { color: var(--text-muted); font-size: var(--text-xs); font-family: var(--font-mono); }
	.sep { height: 1px; margin: 4px 6px; background-color: var(--border); }
</style>
