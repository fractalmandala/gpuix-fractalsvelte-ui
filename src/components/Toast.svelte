<script lang="ts">
	import Portal from 'gpuix-fractalsvelte/components/Portal.svelte';
	import { toasts, dismiss } from './toast.svelte.ts';

	let {
		style = null,
		testid = null
	}: {
		/** Inline CSS for the stack, which sits bottom-right by default. */
		style?: string | null;
		testid?: string | null;
	} = $props();

	const FADE = { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.2 } };
</script>

<Portal>
	<div class="stack" {style} testId={testid}>
		{#each toasts as t (t.id)}
			<div class="toast" motion={FADE} testId={testid && `${testid}-${t.id}`}>
				<div class="bar {t.tone}"></div>
				<div class="text">
					{#if t.title}<div class="title">{t.title}</div>{/if}
					<div class="message">{t.message}</div>
				</div>
				<div class="close" onclick={() => dismiss(t.id)} testId={testid && `${testid}-close-${t.id}`}>✕</div>
			</div>
		{/each}
	</div>
</Portal>

<style>
	.stack {
		position: absolute;
		right: 16px;
		bottom: 16px;
		width: 320px;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	.toast {
		display: flex;
		flex-direction: row;
		background-color: var(--ui-overlay);
		color: var(--ui-ink);
		border-width: 1px;
		border-color: var(--ui-border);
		border-radius: var(--ui-radius-md);
	}
	.bar { width: 4px; align-self: stretch; background-color: var(--ui-border-strong); }
	.bar.accent { background-color: var(--ui-accent); }
	.bar.success { background-color: var(--ui-success); }
	.bar.warn { background-color: var(--ui-warn); }
	.bar.danger { background-color: var(--ui-danger); }
	.text {
		display: flex;
		flex-direction: column;
		gap: 2px;
		flex-grow: 1;
		padding: 10px 12px;
	}
	.title { font-size: var(--ui-text-md); font-weight: 600; }
	.message { font-size: var(--ui-text-sm); line-height: 18px; color: var(--ui-ink-muted); }
	.close {
		display: flex; align-items: center; justify-content: center;
		width: 22px; height: 22px; margin: 8px 8px 0 0;
		border-radius: var(--ui-radius-sm);
		color: var(--ui-ink-muted); font-size: 11px; cursor: pointer;
	}
	.close:hover { background-color: var(--ui-raised); color: var(--ui-ink); }
</style>
