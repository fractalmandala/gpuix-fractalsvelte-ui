<script lang="ts">
	import type { Snippet } from 'svelte';
	import { on_window_key } from 'gpuix-fractalsvelte';
	import Portal from 'gpuix-fractalsvelte/components/Portal.svelte';

	let {
		open = false,
		onclose = undefined,
		title = '',
		size = 'md',
		dismissable = true,
		children,
		footer = undefined,
		style = null,
		testid = null
	}: {
		open?: boolean;
		/** Called on scrim click, Escape or the close button; the parent sets `open = false`. */
		onclose?: () => void;
		title?: string;
		/** Dialog width: sm 360, md 480, lg 640. */
		size?: 'sm' | 'md' | 'lg';
		/** `false` ignores scrim clicks and Escape. */
		dismissable?: boolean;
		children: Snippet;
		/** Action row, right-aligned. */
		footer?: Snippet;
		style?: string | null;
		testid?: string | null;
	} = $props();

	$effect(() => {
		if (!open || !dismissable) return;
		return on_window_key('keydown', (e) => {
			if (e.key === 'escape') onclose?.();
		});
	});
</script>

{#if open}
	<Portal>
		<div class="scrim" onclick={() => dismissable && onclose?.()} testId={testid && `${testid}-scrim`}>
			<div class="dialog modal-w-{size}" onclick={() => {}} {style} testId={testid}>
				{#if title}
					<div class="head">
						<div class="title">{title}</div>
						{#if dismissable}
							<div class="close" onclick={() => onclose?.()} testId={testid && `${testid}-close`}>✕</div>
						{/if}
					</div>
				{/if}
				<div class="body">{@render children()}</div>
				{#if footer}<div class="foot">{@render footer()}</div>{/if}
			</div>
		</div>
	</Portal>
{/if}

<style>
	.scrim {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: var(--bg-extra);
	}
	.dialog {
		display: flex;
		flex-direction: column;
		max-height: 90%;
		background-color: var(--bg-sunken);
		color: var(--text-primary);
		border-width: 1px;
		border-color: var(--border);
		border-radius: var(--radius-lg);
		overflow: hidden;
	}
	.head { display: flex; flex-direction: row; align-items: center; justify-content: space-between; padding: 16px 20px 0 20px; }
	.title { font-size: var(--text-lg); font-weight: 600; }
	.close {
		display: flex; align-items: center; justify-content: center;
		width: 24px; height: 24px; border-radius: var(--radius-sm);
		color: var(--text-secondary); cursor: pointer; font-size: 12px;
	}
	.close:hover { background-color: var(--bg-raised); color: var(--text-primary); }
	.body { display: flex; flex-direction: column; gap: 8px; padding: 12px 20px 20px 20px; color: var(--text-secondary); line-height: 20px; }
	.foot { display: flex; flex-direction: row; justify-content: end; gap: 8px; padding: 12px 20px; border-top-width: 1px; border-color: var(--border); background-color: var(--bg-surface); border-bottom-left-radius: var(--radius-lg); border-bottom-right-radius: var(--radius-lg); }
</style>
