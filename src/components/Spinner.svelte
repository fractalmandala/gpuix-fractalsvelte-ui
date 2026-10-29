<script lang="ts">
	import type { Size, Tone } from '../types.ts';

	let {
		size = 'md',
		tone = 'accent',
		style = null,
		testid = null
	}: {
		size?: Size;
		/** Dot colour. */
		tone?: Tone;
		style?: string | null;
		testid?: string | null;
	} = $props();

	const BOX = { sm: 16, md: 24, lg: 32 } as const;
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
		<div class="dot {tone}" style="left: {d.x}px; top: {d.y}px; width: {dot}px; height: {dot}px; opacity: {d.o}"></div>
	{/each}
</div>

<style>
	.spin { position: relative; }
	.spin.sm { width: 16px; height: 16px; }
	.spin.md { width: 24px; height: 24px; }
	.spin.lg { width: 32px; height: 32px; }
	.dot { position: absolute; border-radius: var(--ui-radius-full); }
	.dot.accent { background-color: var(--ui-accent); }
	.dot.neutral { background-color: var(--ui-ink-muted); }
	.dot.success { background-color: var(--ui-success); }
	.dot.warn { background-color: var(--ui-warn); }
	.dot.danger { background-color: var(--ui-danger); }
</style>
