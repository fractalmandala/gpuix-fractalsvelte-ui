<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		children = undefined,
		label = '',
		variant = 'secondary',
		size = 'md',
		style = null,
		testid = null
	}: {
		/** Content; `label` is the plain-text shorthand. */
		children?: Snippet;
		label?: string;
		/** Fractalstyler's status names, drawn as a tinted pill. */
		variant?: 'secondary' | 'info' | 'success' | 'warning' | 'danger';
		size?: 'sm' | 'md';
		style?: string | null;
		testid?: string | null;
	} = $props();
</script>

<div class="badge {variant} {size}" {style} testId={testid}>
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
		border-radius: var(--radius-full);
		font-weight: 500;
		white-space: nowrap;
		user-select: none;
	}
	.badge.sm { height: 18px; padding: 0 7px; font-size: var(--text-xs); }
	.badge.md { height: 22px; padding: 0 9px; font-size: var(--text-sm); }

	.badge.secondary { background-color: var(--bg-raised); color: var(--text-secondary); }
	.badge.info { background-color: var(--info-soft); color: var(--info); }
	.badge.success { background-color: var(--success-soft); color: var(--success); }
	.badge.warning { background-color: var(--warning-soft); color: var(--warning); }
	.badge.danger { background-color: var(--danger-soft); color: var(--danger); }
</style>
