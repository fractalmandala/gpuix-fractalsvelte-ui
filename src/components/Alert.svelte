<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { GpuixEvent } from 'gpuix-fractalsvelte';

	let {
		title = '',
		variant = 'info',
		children = undefined,
		onclose = undefined,
		style = null,
		testid = null
	}: {
		title?: string;
		/** Fractalstyler's status names. */
		variant?: 'info' | 'secondary' | 'success' | 'warning' | 'danger';
		/** Body content under the title. */
		children?: Snippet;
		/** Shows a dismiss button; the parent removes the alert. */
		onclose?: () => void;
		style?: string | null;
		testid?: string | null;
	} = $props();

	let focused = $state(false);

	function key(e: GpuixEvent) {
		if (e.key === 'enter' || e.key === 'space') onclose?.();
	}
</script>

<div class="alert {variant}" {style} testId={testid}>
	<div class="dot {variant}"></div>
	<div class="text">
		{#if title}<div class="title">{title}</div>{/if}
		{#if children}<div class="body">{@render children()}</div>{/if}
	</div>
	{#if onclose}
		<div
			class="close"
			class:focused
			tabindex={0}
			onclick={() => onclose()}
			onkeydown={key}
			onfocus={() => (focused = true)}
			onblur={() => (focused = false)}
			testId={testid && `${testid}-close`}
		>✕</div>
	{/if}
</div>

<style>
	.alert {
		display: flex;
		flex-direction: row;
		align-items: flex-start;
		gap: 10px;
		padding: 12px 14px;
		border-width: 1px;
		border-radius: var(--radius-md);
	}
	.alert.info { background-color: var(--info-soft); border-color: var(--info); }
	.alert.secondary { background-color: var(--bg-raised); border-color: var(--border-strong); }
	.alert.success { background-color: var(--success-soft); border-color: var(--success); }
	.alert.warning { background-color: var(--warning-soft); border-color: var(--warning); }
	.alert.danger { background-color: var(--danger-soft); border-color: var(--danger); }

	.dot { width: 8px; height: 8px; margin-top: 5px; border-radius: var(--radius-full); }
	.dot.info { background-color: var(--info); }
	.dot.secondary { background-color: var(--text-secondary); }
	.dot.success { background-color: var(--success); }
	.dot.warning { background-color: var(--warning); }
	.dot.danger { background-color: var(--danger); }

	.text { display: flex; flex-direction: column; flex-grow: 1; gap: 2px; }
	.title { color: var(--text-primary); font-size: var(--text-sm); font-weight: 600; line-height: 18px; }
	.body { color: var(--text-secondary); font-size: var(--text-sm); line-height: 18px; }

	.close {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 22px;
		height: 22px;
		border-width: 1px;
		border-color: #00000000;
		border-radius: var(--radius-sm);
		color: var(--text-secondary);
		font-size: 11px;
		cursor: pointer;
	}
	.close:hover { background-color: var(--bg-raised); color: var(--text-primary); }
	.close.focused { border-color: var(--ring); }
</style>
