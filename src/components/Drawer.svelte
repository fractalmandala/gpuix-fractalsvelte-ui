<script lang="ts">
	import type { Snippet } from 'svelte';
	import { on_window_key } from 'gpuix-fractalsvelte';
	import Portal from 'gpuix-fractalsvelte/components/Portal.svelte';
	import Scroller from 'gpuix-fractalsvelte/components/Scroller.svelte';
	import type { Size } from '../types.ts';

	const WIDTH = { sm: 320, md: 420, lg: 560 };
	const HEIGHT = { sm: 240, md: 320, lg: 440 };
	const FADE = { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.2 } };

	let {
		open = false,
		onclose = undefined,
		side = 'right',
		size = 'md',
		title = '',
		dismissable = true,
		children,
		footer = undefined,
		style = null,
		testid = null
	}: {
		open?: boolean;
		/** Called on scrim click, Escape or the ✕ button; the parent sets `open = false`. */
		onclose?: () => void;
		/** The edge the panel slides in from. */
		side?: 'left' | 'right' | 'bottom';
		/** Width for `left` and `right`, height for `bottom`. */
		size?: Size;
		title?: string;
		/** `false` ignores scrim clicks and Escape. */
		dismissable?: boolean;
		children: Snippet;
		/** Action row, right-aligned. */
		footer?: Snippet;
		style?: string | null;
		testid?: string | null;
	} = $props();

	const extent = $derived(side === 'bottom' ? HEIGHT[size] : WIDTH[size]);
	const box = $derived(side === 'bottom' ? `height: ${HEIGHT[size]}px` : `width: ${WIDTH[size]}px`);
	const panel_style = $derived(style ? `${box}; ${style}` : box);
	const slide = (offset: number) => (side === 'left' ? { left: offset } : side === 'right' ? { right: offset } : { bottom: offset });

	$effect(() => {
		if (!open || !dismissable) return;
		return on_window_key('keydown', (e) => {
			if (e.key === 'escape') onclose?.();
		});
	});
</script>

{#if open}
	<Portal>
		<div class="scrim" onclick={() => dismissable && onclose?.()} motion={FADE} testId={testid && `${testid}-scrim`}>
			<div
				class="panel {side}"
				style={panel_style}
				onclick={() => {}}
				motion={{ initial: slide(-extent), animate: slide(0), transition: { duration: 0.2, ease: 'easeOut' } }}
				testId={testid}
			>
				{#if title}
					<div class="head">
						<div class="title">{title}</div>
						{#if dismissable}
							<div class="close" onclick={() => onclose?.()} testId={testid && `${testid}-close`}>✕</div>
						{/if}
					</div>
				{/if}
				<div class="body">
					<Scroller pad="20px" gap={12}>{@render children()}</Scroller>
				</div>
				{#if footer}<div class="foot">{@render footer()}</div>{/if}
			</div>
		</div>
	</Portal>
{/if}

<style>
	.scrim {
		position: absolute;
		inset: 0;
		background-color: var(--ui-scrim);
	}
	.panel {
		position: absolute;
		display: flex;
		flex-direction: column;
		background-color: var(--ui-overlay);
		color: var(--ui-ink);
		border-color: var(--ui-border);
	}
	.panel.left { top: 0; bottom: 0; left: 0; border-right-width: 1px; }
	.panel.right { top: 0; bottom: 0; right: 0; border-left-width: 1px; }
	.panel.bottom { left: 0; right: 0; bottom: 0; border-top-width: 1px; }
	.head {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
		padding: 16px 20px;
		border-bottom-width: 1px;
		border-color: var(--ui-border);
	}
	.title { font-size: var(--ui-text-lg); font-weight: 600; }
	.close {
		display: flex; align-items: center; justify-content: center;
		width: 24px; height: 24px; border-radius: var(--ui-radius-sm);
		color: var(--ui-ink-muted); cursor: pointer; font-size: 12px;
	}
	.close:hover { background-color: var(--ui-raised); color: var(--ui-ink); }
	.body {
		display: flex;
		flex-direction: column;
		flex-grow: 1;
		min-height: 0;
		color: var(--ui-ink-muted);
		line-height: 20px;
	}
	.foot {
		display: flex;
		flex-direction: row;
		justify-content: end;
		gap: 8px;
		padding: 12px 20px;
		border-top-width: 1px;
		border-color: var(--ui-border);
		background-color: var(--ui-surface);
	}
</style>
