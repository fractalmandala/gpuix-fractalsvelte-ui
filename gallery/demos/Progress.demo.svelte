<script lang="ts">
	import Progress from '../../src/components/Progress.svelte';
	import Button from '../../src/components/Button.svelte';
	let value = $state(35);
</script>

<div style="display: flex; flex-direction: column; gap: 14px; width: 420px">
	<div style="display: flex; flex-direction: row; gap: 8px; align-items: center">
		<Button label="-10" size="sm" variant="outline" tone="neutral" onclick={() => (value = Math.max(0, value - 10))} />
		<Button label="+10" size="sm" variant="outline" tone="neutral" onclick={() => (value = Math.min(100, value + 10))} />
		<div style="color: var(--ui-ink-muted)">{value}%</div>
	</div>
	<Progress {value} size="sm" />
	<Progress {value} />
	<Progress {value} size="lg" tone="success" />
	<Progress {value} tone="warn" />
	<Progress {value} tone="danger" />
	<Progress indeterminate tone="neutral" />
</div>
