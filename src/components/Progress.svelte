<script lang="ts">
	import type { Size, Tone } from '../types.ts';

	let {
		value = 0,
		indeterminate = false,
		tone = 'accent',
		size = 'md',
		style = null,
		testid = null
	}: {
		/** 0 to 100; out-of-range values are clamped. */
		value?: number;
		/** Ignores `value` and sweeps a segment back and forth. */
		indeterminate?: boolean;
		tone?: Tone;
		size?: Size;
		style?: string | null;
		testid?: string | null;
	} = $props();

	const pct = $derived(Math.min(100, Math.max(0, value)));

	const TICKS = 60;
	let tick = $state(0);

	$effect(() => {
		if (!indeterminate) return;
		const id = setInterval(() => (tick = (tick + 1) % TICKS), 30);
		return () => clearInterval(id);
	});

	// 0 → 1 → 0 over one cycle, eased, so the segment's left edge travels the free track.
	const sweep = $derived(0.5 - 0.5 * Math.cos((2 * Math.PI * tick) / TICKS));
</script>

<div class="track {size}" role="progressbar" aria-valuetext={indeterminate ? 'loading' : `${pct}%`} {style} testId={testid}>
	{#if indeterminate}
		<div class="grow" style="flex-grow: {sweep}"></div>
		<div class="bar {tone} {size}" style="width: 30%" testId={testid && `${testid}-fill`}></div>
		<div class="grow" style="flex-grow: {1 - sweep}"></div>
	{:else}
		<div class="bar {tone} {size}" style="width: {pct}%" testId={testid && `${testid}-fill`}></div>
	{/if}
</div>

<style>
	.track {
		display: flex;
		flex-direction: row;
		align-items: center;
		width: 100%;
		background-color: var(--ui-raised);
		border-radius: var(--ui-radius-full);
		overflow: hidden;
	}
	.track.sm { height: 4px; }
	.track.md { height: 6px; }
	.track.lg { height: 8px; }
	.bar { height: 100%; border-radius: var(--ui-radius-full); }
	.bar.sm { height: 4px; }
	.bar.md { height: 6px; }
	.bar.lg { height: 8px; }
	.bar.accent { background-color: var(--ui-accent); }
	.bar.neutral { background-color: var(--ui-ink-muted); }
	.bar.success { background-color: var(--ui-success); }
	.bar.warn { background-color: var(--ui-warn); }
	.bar.danger { background-color: var(--ui-danger); }
</style>
