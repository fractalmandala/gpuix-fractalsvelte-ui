<script lang="ts">

	let {
		size = 'h-bs',
		variant = 'themed',
		style = null,
		testid = null
	}: {
		/** Fractalstyler's height steps; the ring fits that size. */
		size?: 'h-sm' | 'h-md' | 'h-bs' | 'h-lg';
		/** Dot colour, in fractalstyler's names. */
		variant?: 'themed' | 'secondary' | 'info' | 'success' | 'warning' | 'danger';
		style?: string | null;
		testid?: string | null;
	} = $props();

	const BOX = { 'h-sm': 16, 'h-md': 20, 'h-bs': 24, 'h-lg': 32 } as const;
	const COUNT = 8;

	// GPUI has no looping motion, so a timer steps the lead dot around the ring.
	let head = $state(0);

	$effect(() => {
		const id = setInterval(() => (head = (head + 1) % COUNT), 90);
		return () => clearInterval(id);
	});

	const box = $derived(BOX[size]);
	const dot = $derived(Math.round(box / 6));
	const dots = $derived(
		Array.from({ length: COUNT }, (_, i) => {
			const angle = (i / COUNT) * 2 * Math.PI - Math.PI / 2;
			const r = box / 2 - dot / 2;
			const behind = (head - i + COUNT) % COUNT;
			return {
				i,
				x: box / 2 + r * Math.cos(angle) - dot / 2,
				y: box / 2 + r * Math.sin(angle) - dot / 2,
				o: 1 - (behind / COUNT) * 0.85
			};
		})
	);
</script>

<div class="spin {size}" {style} testId={testid}>
	{#each dots as d (d.i)}
		<div class="dot {variant}" style="left: {d.x}px; top: {d.y}px; width: {dot}px; height: {dot}px; opacity: {d.o}"></div>
	{/each}
</div>

<style>
	.spin { position: relative; }
	.spin.h-sm { width: var(--height-sm); height: var(--height-sm); }
	.spin.h-md { width: var(--height-md); height: var(--height-md); }
	.spin.h-bs { width: var(--height-bs); height: var(--height-bs); }
	.spin.h-lg { width: var(--height-lg); height: var(--height-lg); }
	.dot { position: absolute; border-radius: var(--radius-full); }
	.dot.themed { background-color: var(--theme-color); }
	.dot.secondary { background-color: var(--text-secondary); }
	.dot.info { background-color: var(--info); }
	.dot.success { background-color: var(--success); }
	.dot.warning { background-color: var(--warning); }
	.dot.danger { background-color: var(--danger); }
</style>
