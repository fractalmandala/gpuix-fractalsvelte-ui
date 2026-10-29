<script lang="ts" generics="T extends string">
	import type { Snippet } from 'svelte';
	import type { GpuixEvent } from 'gpuix-fractalsvelte';
	import { provide_group } from '../group.svelte.ts';

	type Option = { value: T; label: string; disabled?: boolean };

	let {
		children = undefined,
		options = undefined,
		value = null,
		onchange = undefined,
		variant = 'primary',
		size = 'h-bs',
		style = null,
		testid = null
	}: {
		/** Attached mode: the child buttons laid out edge to edge. */
		children?: Snippet;
		/** Segmented mode: one selectable segment per option. Use instead of `children`. */
		options?: Option[];
		value?: T | null;
		onchange?: (value: T) => void;
		/** Fractalstyler's variant for the selected segment. */
		variant?: 'primary' | 'secondary' | 'themed' | 'outline' | 'ghost' | 'link' | 'info' | 'success' | 'warning' | 'danger';
		/** Fractalstyler's size axis. */
		size?: 'h-sm' | 'h-md' | 'h-bs' | 'h-lg' | 'h-xl';
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
		class="track"
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
				class="seg el-size {size} {selected ? `el-variant ${variant}` : ''}"
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
		border-color: var(--border);
		border-radius: var(--radius-md);
		background-color: var(--bg-raised);
	}
	.track.focused { border-color: var(--ring); }
	.seg {
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: var(--radius-sm);
		font-weight: 500;
		color: var(--text-secondary);
		user-select: none;
		white-space: nowrap;
	}
	.seg.on { cursor: pointer; }
	.seg.off { opacity: 0.5; cursor: not-allowed; }
	.joined { display: flex; flex-direction: row; align-items: center; align-self: flex-start; gap: 0; }
</style>
