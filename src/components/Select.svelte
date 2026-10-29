<script lang="ts">
	import { get_native, type GpuixEvent, type ShadowNode } from 'gpuix-fractalsvelte';
	import Popover from 'gpuix-fractalsvelte/components/Popover.svelte';
	import Scroller from 'gpuix-fractalsvelte/components/Scroller.svelte';

	type Option = { value: string; label: string; disabled?: boolean };

	let {
		options,
		value = null,
		onchange = undefined,
		placeholder = 'Select…',
		size = 'h-lg',
		disabled = false,
		style = null,
		testid = null
	}: {
		options: Option[];
		/** The chosen option's value, or `null` to show the placeholder. */
		value?: string | null;
		onchange?: (value: string) => void;
		placeholder?: string;
		/** Fractalstyler's height steps for the trigger and rows. */
		size?: 'h-md' | 'h-bs' | 'h-lg' | 'h-xl';
		disabled?: boolean;
		/** Inline CSS for the trigger; `width` defaults to 200px. */
		style?: string | null;
		testid?: string | null;
	} = $props();

	const ITEM = { 'h-md': 20, 'h-bs': 24, 'h-lg': 32, 'h-xl': 40 } as const;
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
			class="item el-size {size}"
			class:on={enabled(i)}
			class:off={!enabled(i)}
			class:hl={i === active}
			{@attach (node: ShadowNode) => (items[i] = node)}
			onmouseenter={() => enabled(i) && (active = i)}
			onclick={() => pick(i)}
			testId={testid && `${testid}-option-${opt.value}`}
		>
			<div class="check">{i === selected ? '✓' : ''}</div>
			<div class="name">{opt.label}</div>
		</div>
	{/each}
{/snippet}

<Popover
	{open}
	onclose={() => (open = false)}
	gap={4}
	style="width: {width}px; padding: 4px; border-radius: var(--radius-md); border-color: var(--border); background-color: var(--bg-sunken); color: var(--text-primary)"
	{testid}
>
	<div
		class="trigger el-size {size}"
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
		<div class="value" class:placeholder={selected < 0}>{selected >= 0 ? options[selected].label : placeholder}</div>
		<div class="chevron">▾</div>
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
		border-color: var(--border-strong);
		border-radius: var(--radius-md);
		background-color: var(--bg-surface);
		color: var(--text-primary);
		user-select: none;
	}
	.trigger.on { cursor: pointer; }
	.trigger.off { opacity: 0.5; cursor: not-allowed; }
	.trigger.focused { border-color: var(--ring); }

	.value { flex-grow: 1; }
	.value.placeholder { color: var(--text-muted); }
	.chevron { color: var(--text-secondary); }

	.item {
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: 6px;
		padding: 0 8px;
		border-radius: var(--radius-sm);
		color: var(--text-primary);
		user-select: none;
	}
	.item.on { cursor: pointer; }
	.item.off { color: var(--text-muted); cursor: not-allowed; }
	.item.hl { background-color: var(--bg-raised); }

	.check { width: 12px; color: var(--theme-color); }
	.name { flex-grow: 1; }
</style>
