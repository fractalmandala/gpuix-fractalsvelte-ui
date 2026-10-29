<script lang="ts">
	import type { Snippet } from 'svelte';
	import GpuixTooltip from 'gpuix-fractalsvelte/components/Tooltip.svelte';

	let {
		children,
		content,
		side = 'top',
		align = 'center',
		gap = 6,
		delay = 300,
		open = null,
		style = null,
		testid = null
	}: {
		/** The trigger; spread the handlers it receives onto it so hover still works. */
		children: Snippet<[{ onmouseenter: () => void; onmouseleave: () => void }]>;
		content: string | Snippet;
		side?: 'top' | 'right' | 'bottom' | 'left';
		align?: 'start' | 'center' | 'end';
		gap?: number;
		/** ms of hover before the tip shows. */
		delay?: number;
		/** Forces the tip shown or hidden; `null` leaves it to hover. */
		open?: boolean | null;
		style?: string | null;
		testid?: string | null;
	} = $props();

	const tip = $derived(
		`background-color: var(--ui-ink); color: var(--ui-bg); font-size: var(--ui-text-sm); border-radius: var(--ui-radius-sm); padding: 4px 8px${style ? `; ${style}` : ''}`
	);
</script>

<GpuixTooltip {children} {content} {side} {align} {gap} {delay} {open} style={tip} {testid} />
