<script lang="ts">

	let {
		value = 0,
		indeterminate = false,
		variant = 'themed',
		size = 'md',
		style = null,
		testid = null
	}: {
		/** 0 to 100; out-of-range values are clamped. */
		value?: number;
		/** Ignores `value` and sweeps a segment back and forth. */
		indeterminate?: boolean;
		/** Fractalstyler's colour names. */
		variant?: 'themed' | 'secondary' | 'info' | 'success' | 'warning' | 'danger';
		/** Bar thickness: 4, 6 or 8 px. */
		size?: 'sm' | 'md' | 'lg';
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

<div class="track progress-{size}" role="progressbar" aria-valuetext={indeterminate ? 'loading' : `${pct}%`} {style} testId={testid}>
	{#if indeterminate}
		<div class="grow" style="flex-grow: {sweep}"></div>
		<div class="bar {variant} progress-{size}" style="width: 30%" testId={testid && `${testid}-fill`}></div>
		<div class="grow" style="flex-grow: {1 - sweep}"></div>
	{:else}
		<div class="bar {variant} progress-{size}" style="width: {pct}%" testId={testid && `${testid}-fill`}></div>
	{/if}
</div>

<style>
	.track {
		display: flex;
		flex-direction: row;
		align-items: center;
		width: 100%;
		background-color: var(--bg-raised);
		border-radius: var(--radius-full);
		overflow: hidden;
	}
	.bar { height: 100%; border-radius: var(--radius-full); }
	.bar.themed { background-color: var(--theme-color); }
	.bar.secondary { background-color: var(--text-secondary); }
	.bar.info { background-color: var(--info); }
	.bar.success { background-color: var(--success); }
	.bar.warning { background-color: var(--warning); }
	.bar.danger { background-color: var(--danger); }
</style>
