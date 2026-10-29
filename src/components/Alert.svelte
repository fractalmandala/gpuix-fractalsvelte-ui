<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { Tone } from '../types.ts';
	import type { GpuixEvent } from 'gpuix-fractalsvelte';

	let {
		title = '',
		tone = 'accent',
		children = undefined,
		onclose = undefined,
		style = null,
		testid = null
	}: {
		title?: string;
		tone?: Tone;
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

<div class="alert {tone}" {style} testId={testid}>
	<div class="dot {tone}"></div>
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
		border-radius: var(--ui-radius-md);
	}
	.alert.accent { background-color: var(--ui-accent-soft); border-color: var(--ui-accent); }
	.alert.neutral { background-color: var(--ui-raised); border-color: var(--ui-border-strong); }
	.alert.success { background-color: var(--ui-success-soft); border-color: var(--ui-success); }
	.alert.warn { background-color: var(--ui-warn-soft); border-color: var(--ui-warn); }
	.alert.danger { background-color: var(--ui-danger-soft); border-color: var(--ui-danger); }

	.dot { width: 8px; height: 8px; margin-top: 5px; border-radius: var(--ui-radius-full); }
	.dot.accent { background-color: var(--ui-accent); }
	.dot.neutral { background-color: var(--ui-ink-muted); }
	.dot.success { background-color: var(--ui-success); }
	.dot.warn { background-color: var(--ui-warn); }
	.dot.danger { background-color: var(--ui-danger); }

	.text { display: flex; flex-direction: column; flex-grow: 1; gap: 2px; }
	.title { color: var(--ui-ink); font-size: var(--ui-text-sm); font-weight: 600; line-height: 18px; }
	.body { color: var(--ui-ink-muted); font-size: var(--ui-text-sm); line-height: 18px; }

	.close {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 22px;
		height: 22px;
		border-width: 1px;
		border-color: #00000000;
		border-radius: var(--ui-radius-sm);
		color: var(--ui-ink-muted);
		font-size: 11px;
		cursor: pointer;
	}
	.close:hover { background-color: var(--ui-raised); color: var(--ui-ink); }
	.close.focused { border-color: var(--ui-ring); }
</style>
