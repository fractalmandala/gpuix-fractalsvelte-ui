<script lang="ts">
	let {
		orientation = 'horizontal',
		label = '',
		style = null,
		testid = null
	}: {
		orientation?: 'horizontal' | 'vertical';
		/** Shown centred in a horizontal divider. */
		label?: string;
		style?: string | null;
		testid?: string | null;
	} = $props();
</script>

{#if orientation === 'vertical'}
	<div class="rule vertical" {style} testId={testid}></div>
{:else if label}
	<div class="labelled" {style} testId={testid}>
		<div class="line"></div>
		<div class="label">{label}</div>
		<div class="line"></div>
	</div>
{:else}
	<div class="rule horizontal" {style} testId={testid}></div>
{/if}

<style>
	.rule { background-color: var(--border); align-self: stretch; }
	.rule.horizontal { height: 1px; }
	.rule.vertical { width: 1px; }
	.labelled { display: flex; flex-direction: row; align-items: center; gap: 8px; align-self: stretch; }
	.line { flex-grow: 1; height: 1px; background-color: var(--border); }
	.label { font-size: var(--text-sm); color: var(--text-muted); }
</style>
