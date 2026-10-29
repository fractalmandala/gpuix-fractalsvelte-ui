<script lang="ts">
	import type { Snippet } from 'svelte';
	import GpuixPopover from 'gpuix-fractalsvelte/components/Popover.svelte';

	let {
		open,
		onclose,
		children,
		content,
		side = 'bottom',
		align = 'start',
		gap = 4,
		position = null,
		style = null,
		testid = null
	}: {
		open: boolean;
		/** A press outside the panel and its trigger, or Escape. */
		onclose: () => void;
		/** The trigger; it toggles `open` itself. */
		children: Snippet;
		content: Snippet;
		side?: 'top' | 'right' | 'bottom' | 'left';
		align?: 'start' | 'center' | 'end';
		gap?: number;
		/** Window coordinates to hang from instead of the trigger. */
		position?: { x: number; y: number } | null;
		style?: string | null;
		testid?: string | null;
	} = $props();

	const panel = $derived(
		`background-color: var(--bg-sunken); color: var(--text-primary); font-size: var(--text-md); border-width: 1px; border-color: var(--border); border-radius: var(--radius-md); padding: 4px; min-width: 160px${style ? `; ${style}` : ''}`
	);
</script>

<GpuixPopover {open} {onclose} {children} {content} {side} {align} {gap} {position} style={panel} {testid} />
