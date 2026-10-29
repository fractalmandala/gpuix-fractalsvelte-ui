<script lang="ts">
	import { get_native, type GpuixEvent, type ShadowNode } from 'gpuix-fractalsvelte';
	import Popover from 'gpuix-fractalsvelte/components/Popover.svelte';
	import Scroller from 'gpuix-fractalsvelte/components/Scroller.svelte';
	import type { Size } from '../types.ts';

	type Option = { value: string; label: string; disabled?: boolean };

	let {
		options,
		value = null,
		onchange = undefined,
		placeholder = 'Select…',
		size = 'md',
		disabled = false,
		style = null,
		testid = null
	}: {
		options: Option[];
		/** The chosen option's value, or `null` to show the placeholder. */
		value?: string | null;
		onchange?: (value: string) => void;
		placeholder?: string;
		size?: Size;
		disabled?: boolean;
		/** Inline CSS for the trigger; `width` defaults to 200px. */
		style?: string | null;
		testid?: string | null;
	} = $props();

	const ITEM = { sm: 24, md: 30, lg: 36 } as const;
	const MAX_ROWS = 8;

	let open = $state(false);
	let active = $state(-1);
	let width = $state(200);
	let focused = $state(false);
	let trigger: ShadowNode | null = null;
	const items: (ShadowNode | undefined)[] = [];

	const selected = $derived(options.findIndex((o) => o.value === value));
	const enabled = (i: number) => !disabled && !options[i].disabled;
	const long = $derived(options.length > MAX_ROWS);

	function toggle() {
		if (disabled) return;
		if (open) {
			open = false;
			return;
		}
		const box = trigger?.nativeId == null ? null : get_native()?.getElementBounds(trigger.nativeId);
		if (box) width = box.width;
		active = selected >= 0 ? selected : options.findIndex((o) => !o.disabled);
		open = true;
	}

	function pick(i: number) {
		if (i < 0 || !enabled(i)) return;
		open = false;
		if (options[i].value !== value) onchange?.(options[i].value);
	}

	function move(dir: 1 | -1) {
		for (let i = active + dir; i >= 0 && i < options.length; i += dir) {
			if (!options[i].disabled) {
				active = i;
				const node = items[i];
				if (node?.nativeId != null) get_native()?.scrollIntoView(node.nativeId);
				return;
			}
		}
	}

	// Focus stays on the trigger while the list is open, so arrows move a highlight rather than focus.
	function key(e: GpuixEvent) {
		if (!open) {
			if (e.key === 'enter' || e.key === 'space' || e.key === 'down' || e.key === 'up') toggle();
		} else if (e.key === 'down') move(1);
		else if (e.key === 'up') move(-1);
		else if (e.key === 'enter' || e.key === 'space') pick(active);
		else if (e.key === 'tab') open = false;
	}
</script>

{#snippet list()}
	{#each options as opt, i (opt.value)}
		<div
			class="item {size}"
			class:on={enabled(i)}
			class:off={!enabled(i)}
			class:hl={i === active}
			{@attach (node: ShadowNode) => (items[i] = node)}
			onmouseenter={() => enabled(i) && (active = i)}
			onclick={() => pick(i)}
			testId={testid && `${testid}-option-${opt.value}`}
		>
			<div class="check {size}">{i === selected ? '✓' : ''}</div>
			<div class="name {size}">{opt.label}</div>
		</div>
	{/each}
{/snippet}

<Popover
	{open}
	onclose={() => (open = false)}
	gap={4}
	style="width: {width}px; padding: 4px; border-radius: var(--ui-radius-md); border-color: var(--ui-border); background-color: var(--ui-overlay); color: var(--ui-ink)"
	{testid}
>
	<div
		class="trigger {size}"
		class:on={!disabled}
		class:off={disabled}
		class:focused
		tabindex={disabled ? -1 : 0}
		onclick={toggle}
		onkeydown={key}
		onfocus={() => (focused = true)}
		onblur={() => (focused = false)}
		{@attach (node: ShadowNode) => (trigger = node)}
		{style}
		testId={testid && `${testid}-trigger`}
	>
		<div class="value {size}" class:placeholder={selected < 0}>{selected >= 0 ? options[selected].label : placeholder}</div>
		<div class="chevron {size}">▾</div>
	</div>

	{#snippet content()}
		{#if long}
			<div style="height: {MAX_ROWS * ITEM[size]}px">
				<Scroller gap={0} testid={testid && `${testid}-scroll`}>{@render list()}</Scroller>
			</div>
		{:else}
			{@render list()}
		{/if}
	{/snippet}
</Popover>

<style>
	.trigger {
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: 8px;
		width: 200px;
		padding: 0 10px;
		border-width: 1px;
		border-color: var(--ui-border-strong);
		border-radius: var(--ui-radius-md);
		background-color: var(--ui-surface);
		color: var(--ui-ink);
		user-select: none;
	}
	.trigger.sm { height: 26px; font-size: var(--ui-text-sm); border-radius: var(--ui-radius-sm); }
	.trigger.md { height: 32px; font-size: var(--ui-text-md); }
	.trigger.lg { height: 40px; font-size: var(--ui-text-lg); border-radius: var(--ui-radius-lg); }
	.trigger.on { cursor: pointer; }
	.trigger.off { opacity: 0.5; cursor: not-allowed; }
	.trigger.focused { border-color: var(--ui-ring); }

	.value { flex-grow: 1; }
	.value.placeholder { color: var(--ui-ink-faint); }
	.chevron { color: var(--ui-ink-muted); }
	.chevron.sm { font-size: var(--ui-text-xs); }
	.chevron.md { font-size: var(--ui-text-sm); }
	.chevron.lg { font-size: var(--ui-text-md); }

	.item {
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: 6px;
		padding: 0 8px;
		border-radius: var(--ui-radius-sm);
		color: var(--ui-ink);
		user-select: none;
	}
	.item.sm { height: 24px; font-size: var(--ui-text-sm); }
	.item.md { height: 30px; font-size: var(--ui-text-md); }
	.item.lg { height: 36px; font-size: var(--ui-text-lg); }
	.item.on { cursor: pointer; }
	.item.off { color: var(--ui-ink-faint); cursor: not-allowed; }
	.item.hl { background-color: var(--ui-raised); }

	.check { width: 12px; color: var(--ui-accent); }
	.check.sm { font-size: var(--ui-text-xs); }
	.check.md { font-size: var(--ui-text-sm); }
	.check.lg { font-size: var(--ui-text-md); }
	.name { flex-grow: 1; }
</style>
