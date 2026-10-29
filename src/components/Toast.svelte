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
				<div class="bar {t.variant}"></div>
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
		background-color: var(--bg-sunken);
		color: var(--text-primary);
		border-width: 1px;
		border-color: var(--border);
		border-radius: var(--radius-md);
	}
	.bar { width: 4px; align-self: stretch; background-color: var(--border-strong); }
	.bar.secondary { background-color: var(--text-secondary); }
	.bar.themed { background-color: var(--theme-color); }
	.bar.info { background-color: var(--info); }
	.bar.success { background-color: var(--success); }
	.bar.warning { background-color: var(--warning); }
	.bar.danger { background-color: var(--danger); }
	.text {
		display: flex;
		flex-direction: column;
		gap: 2px;
		flex-grow: 1;
		padding: 10px 12px;
	}
	.title { font-size: var(--text-md); font-weight: 600; }
	.message { font-size: var(--text-sm); line-height: 18px; color: var(--text-secondary); }
	.close {
		display: flex; align-items: center; justify-content: center;
		width: 22px; height: 22px; margin: 8px 8px 0 0;
		border-radius: var(--radius-sm);
		color: var(--text-secondary); font-size: 11px; cursor: pointer;
	}
	.close:hover { background-color: var(--bg-raised); color: var(--text-primary); }
</style>
