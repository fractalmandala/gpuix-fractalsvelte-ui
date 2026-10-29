<script lang="ts" module>
	export type MenuItem = {
		label: string;
		onselect?: () => void;
		disabled?: boolean;
		/** Red label, for destructive actions. */
		danger?: boolean;
	};
	export type MenuEntry = MenuItem | { separator: true };
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import { get_native, on_window_key, type GpuixEvent } from 'gpuix-fractalsvelte';
	import Portal from 'gpuix-fractalsvelte/components/Portal.svelte';

	const WIDTH = 220;
	const ROW = 28;
	const RULE = 9;

	let {
		items,
		children,
		style = null,
		testid = null
	}: {
		items: MenuEntry[];
		/** The region that opens the menu on a right click, or ctrl+click on macOS. */
		children: Snippet;
		style?: string | null;
		testid?: string | null;
	} = $props();

	let at = $state<{ x: number; y: number } | null>(null);
	let active = $state(-1);

	const height = $derived(items.reduce((h, e) => h + ('separator' in e ? RULE : ROW), 10));

	// The window cannot resize while a menu is open, so one read at open time is enough.
	function open_at(e: GpuixEvent) {
		const win = get_native()?.getWindowSize();
		const x = e.x ?? 0;
		const y = e.y ?? 0;
		at = win
			? { x: Math.max(0, Math.min(x, win.width - WIDTH)), y: Math.max(0, Math.min(y, win.height - height)) }
			: { x, y };
		active = -1;
	}

	function close() {
		at = null;
		active = -1;
	}

	function choose(i: number) {
		const entry = items[i];
		if (!entry || 'separator' in entry || entry.disabled) return;
		close();
		entry.onselect?.();
	}

	function step(dir: 1 | -1) {
		const n = items.length;
		let i = active < 0 ? (dir > 0 ? -1 : n) : active;
		for (let k = 0; k < n; k++) {
			i = (i + dir + n) % n;
			const entry = items[i];
			if (!('separator' in entry) && !entry.disabled) {
				active = i;
				return;
			}
		}
	}

	$effect(() => {
		if (!at) return;
		return on_window_key('keydown', (e) => {
			if (e.key === 'escape') close();
			else if (e.key === 'down') step(1);
			else if (e.key === 'up') step(-1);
			else if (e.key === 'enter' && active >= 0) choose(active);
		});
	});
</script>

<div class="area" hitbox="self" onclick={(e) => e.modifiers?.ctrl && open_at(e)} onauxclick={(e) => e.isRightClick && open_at(e)} {style} testId={testid}>
	{@render children()}
</div>

{#if at}
	<Portal>
		<div class="scrim" onclick={close} onauxclick={close} testId={testid && `${testid}-scrim`}>
			<div class="menu" style="left: {at.x}px; top: {at.y}px; width: {WIDTH}px" onclick={() => {}} testId={testid && `${testid}-menu`}>
				{#each items as entry, i (i)}
					{#if 'separator' in entry}
						<div class="sep"></div>
					{:else}
						<div
							class="item"
							class:off={entry.disabled}
							class:active={active === i && !entry.disabled}
							class:danger={entry.danger}
							onmouseenter={() => !entry.disabled && (active = i)}
							onmouseleave={() => (active = -1)}
							onclick={() => choose(i)}
						>{entry.label}</div>
					{/if}
				{/each}
			</div>
		</div>
	</Portal>
{/if}

<style>
	.area { display: flex; flex-direction: column; }
	.scrim { position: absolute; inset: 0; }
	.menu {
		position: absolute;
		display: flex;
		flex-direction: column;
		padding: 4px;
		border-width: 1px;
		border-color: var(--ui-border);
		border-radius: var(--ui-radius-md);
		background-color: var(--ui-overlay);
		color: var(--ui-ink);
		font-size: var(--ui-text-md);
	}
	.item {
		display: flex;
		flex-direction: row;
		align-items: center;
		height: 28px;
		padding: 0 10px;
		border-radius: var(--ui-radius-sm);
		line-height: 20px;
		white-space: nowrap;
		user-select: none;
		cursor: pointer;
	}
	.item.active { background-color: var(--ui-raised); }
	.item.danger { color: var(--ui-danger); }
	.item.off { color: var(--ui-ink-faint); cursor: not-allowed; }
	.sep { height: 1px; margin: 4px 0; background-color: var(--ui-border); }
</style>
