<script lang="ts" generics="T extends string">
	import type { Snippet } from 'svelte';
	import type { GpuixEvent } from 'gpuix-fractalsvelte';
	import { provide_group } from '../group.svelte.ts';
	import type { Size, Tone } from '../types.ts';

	type Option = { value: T; label: string; disabled?: boolean };

	let {
		children = undefined,
		options = undefined,
		value = null,
		onchange = undefined,
		tone = 'accent',
		size = 'md',
		style = null,
		testid = null
	}: {
		/** Attached mode: the child buttons laid out edge to edge. */
		children?: Snippet;
		/** Segmented mode: one selectable segment per option. Use instead of `children`. */
		options?: Option[];
		value?: T | null;
		onchange?: (value: T) => void;
		/** Colour of the selected segment. */
		tone?: Tone;
		size?: Size;
		style?: string | null;
		testid?: string | null;
	} = $props();

	provide_group();
	let focused = $state(false);

	function pick(option: Option) {
		if (!option.disabled && option.value !== value) onchange?.(option.value);
	}

	// Arrows wrap around, as in a native radio group, and skip disabled segments.
	function step(delta: number) {
		const live = options!.filter((o) => !o.disabled);
		const at = live.findIndex((o) => o.value === value);
		const next = live[(at + delta + live.length) % live.length];
		if (next) pick(next);
	}

	function key(e: GpuixEvent) {
		if (e.key === 'left' || e.key === 'up') step(-1);
		else if (e.key === 'right' || e.key === 'down') step(1);
	}
</script>

{#if options}
	<div
		class="track {size}"
		class:focused
		tabindex={0}
		onkeydown={key}
		onfocus={() => (focused = true)}
		onblur={() => (focused = false)}
		{style}
		testId={testid}
	>
		{#each options as option (option.value)}
			{@const selected = option.value === value}
			<div
				class="seg {size} {tone}"
				class:sel={selected}
				class:on={!option.disabled}
				class:off={option.disabled}
				onclick={() => pick(option)}
				testId={testid && `${testid}-${option.value}`}
			>
				{option.label}
			</div>
		{/each}
	</div>
{:else}
	<div class="joined" {style} testId={testid}>
		{#if children}{@render children()}{/if}
	</div>
{/if}

<style>
	.track {
		align-self: flex-start;
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: 2px;
		padding: 2px;
		border-width: 1px;
		border-color: var(--ui-border);
		border-radius: var(--ui-radius-md);
		background-color: var(--ui-raised);
	}
	.track.sm { border-radius: var(--ui-radius-sm); }
	.track.focused { border-color: var(--ui-ring); }

	.seg {
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: var(--ui-radius-sm);
		font-weight: 500;
		color: var(--ui-ink-muted);
		user-select: none;
		white-space: nowrap;
	}
	.seg.sm { height: 20px; padding: 0 10px; font-size: var(--ui-text-sm); }
	.seg.md { height: 26px; padding: 0 14px; font-size: var(--ui-text-md); }
	.seg.lg { height: 34px; padding: 0 18px; font-size: var(--ui-text-lg); border-radius: var(--ui-radius-md); }
	.seg.on { cursor: pointer; }
	.seg.on:hover { color: var(--ui-ink); }
	.seg.off { opacity: 0.5; cursor: not-allowed; }

	.seg.sel.accent { background-color: var(--ui-accent); color: var(--ui-accent-ink); }
	.seg.sel.neutral { background-color: var(--ui-surface); color: var(--ui-ink); }
	.seg.sel.success { background-color: var(--ui-success); color: var(--ui-success-ink); }
	.seg.sel.warn { background-color: var(--ui-warn); color: var(--ui-warn-ink); }
	.seg.sel.danger { background-color: var(--ui-danger); color: var(--ui-danger-ink); }

	.joined { display: flex; flex-direction: row; align-items: center; align-self: flex-start; gap: 0; }
</style>
