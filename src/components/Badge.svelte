<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { Tone } from '../types.ts';

	let {
		children = undefined,
		label = '',
		tone = 'neutral',
		variant = 'soft',
		size = 'md',
		style = null,
		testid = null
	}: {
		/** Content; `label` is the plain-text shorthand. */
		children?: Snippet;
		label?: string;
		tone?: Tone;
		/** `solid` fills, `soft` tints, `outline` draws a border. */
		variant?: 'solid' | 'soft' | 'outline';
		size?: 'sm' | 'md';
		style?: string | null;
		testid?: string | null;
	} = $props();
</script>

<div class="badge {variant} {tone} {size}" {style} testId={testid}>
	{#if children}{@render children()}{:else}{label}{/if}
</div>

<style>
	.badge {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
		border-width: 1px;
		border-color: #00000000;
		border-radius: var(--ui-radius-full);
		font-weight: 500;
		white-space: nowrap;
		user-select: none;
	}
	.badge.sm { height: 18px; padding: 0 7px; font-size: var(--ui-text-xs); }
	.badge.md { height: 22px; padding: 0 9px; font-size: var(--ui-text-sm); }

	.badge.solid.accent { background-color: var(--ui-accent); color: var(--ui-accent-ink); }
	.badge.solid.neutral { background-color: var(--ui-ink); color: var(--ui-bg); }
	.badge.solid.success { background-color: var(--ui-success); color: var(--ui-success-ink); }
	.badge.solid.warn { background-color: var(--ui-warn); color: var(--ui-warn-ink); }
	.badge.solid.danger { background-color: var(--ui-danger); color: var(--ui-danger-ink); }

	.badge.soft.accent { background-color: var(--ui-accent-soft); color: var(--ui-accent); }
	.badge.soft.neutral { background-color: var(--ui-raised); color: var(--ui-ink-muted); }
	.badge.soft.success { background-color: var(--ui-success-soft); color: var(--ui-success); }
	.badge.soft.warn { background-color: var(--ui-warn-soft); color: var(--ui-warn); }
	.badge.soft.danger { background-color: var(--ui-danger-soft); color: var(--ui-danger); }

	.badge.outline.accent { border-color: var(--ui-accent); color: var(--ui-accent); }
	.badge.outline.neutral { border-color: var(--ui-border-strong); color: var(--ui-ink-muted); }
	.badge.outline.success { border-color: var(--ui-success); color: var(--ui-success); }
	.badge.outline.warn { border-color: var(--ui-warn); color: var(--ui-warn); }
	.badge.outline.danger { border-color: var(--ui-danger); color: var(--ui-danger); }
</style>
