<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { GpuixEvent } from 'gpuix-fractalsvelte';
	import type { Size } from '../types.ts';

	const SPACE = { sm: 4, md: 8, lg: 16 } as const;

	let {
		children = undefined,
		title = '',
		description = '',
		actions = undefined,
		footer = undefined,
		padding = 'lg',
		clickable = false,
		onclick = undefined,
		style = null,
		testid = null
	}: {
		children?: Snippet;
		title?: string;
		description?: string;
		/** Right side of the header, e.g. icon buttons. */
		actions?: Snippet;
		footer?: Snippet;
		/** Spacing scale or px, on all four sides. */
		padding?: Size | number;
		/** Hover highlight, focus ring, and `onclick` on click, Enter or Space. */
		clickable?: boolean;
		onclick?: (e: GpuixEvent) => void;
		style?: string | null;
		testid?: string | null;
	} = $props();

	let focused = $state(false);
	const css = $derived(`padding: ${typeof padding === 'number' ? padding : SPACE[padding]}px; ${style ?? ''}`);

	// A literal background and a handler on the slot wrappers keep a button's click from also running the card's.
	const swallow = () => {};

	function key(e: GpuixEvent) {
		if (e.key === 'enter' || e.key === 'space') onclick?.(e);
	}
</script>

<div
	class="card"
	class:on={clickable}
	class:focused
	tabindex={clickable ? 0 : undefined}
	onclick={clickable ? onclick : undefined}
	onkeydown={clickable ? key : undefined}
	onfocus={() => (focused = true)}
	onblur={() => (focused = false)}
	style={css}
	testId={testid}
>
	{#if title || description || actions}
		<div class="head">
			<div class="heading">
				{#if title}<div class="title">{title}</div>{/if}
				{#if description}<div class="desc">{description}</div>{/if}
			</div>
			{#if actions}<div class="actions" class:shield={clickable} onclick={clickable ? swallow : undefined}>{@render actions()}</div>{/if}
		</div>
	{/if}
	{#if children}<div class="body">{@render children()}</div>{/if}
	{#if footer}<div class="foot" class:shield={clickable} onclick={clickable ? swallow : undefined}>{@render footer()}</div>{/if}
</div>

<style>
	.card {
		display: flex;
		flex-direction: column;
		gap: 12px;
		background-color: var(--ui-surface);
		color: var(--ui-ink);
		border-width: 1px;
		border-color: var(--ui-border);
		border-radius: var(--ui-radius-lg);
	}
	.card.on { cursor: pointer; }
	.card.on:hover { background-color: var(--ui-raised); }
	.card.focused { border-color: var(--ui-ring); }
	.head { display: flex; flex-direction: row; align-items: start; justify-content: space-between; gap: 12px; }
	.heading { display: flex; flex-direction: column; flex-grow: 1; gap: 4px; }
	.title { font-size: var(--ui-text-lg); font-weight: 600; }
	.desc { font-size: var(--ui-text-sm); color: var(--ui-ink-muted); }
	.actions { display: flex; flex-direction: row; gap: 4px; }
	.shield { background-color: #00000001; }
	.body { display: flex; flex-direction: column; gap: 8px; color: var(--ui-ink-muted); }
	.foot {
		display: flex;
		flex-direction: row;
		justify-content: end;
		gap: 8px;
		padding-top: 12px;
		border-top-width: 1px;
		border-color: var(--ui-border);
	}
</style>
