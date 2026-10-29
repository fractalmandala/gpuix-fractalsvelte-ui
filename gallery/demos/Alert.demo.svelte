<script lang="ts">
	import Alert from '../../src/components/Alert.svelte';
	import Button from '../../src/components/Button.svelte';
	let shown = $state(true);
</script>

<div style="display: flex; flex-direction: column; gap: 12px; width: 460px">
	{#if shown}
		<Alert title="Export complete" tone="success" onclose={() => (shown = false)}>Saved 12 files to ~/Documents/export.</Alert>
	{/if}
	<Alert title="Update available" tone="accent">Version 1.4 adds faster search.</Alert>
	<Alert title="Disk almost full" tone="warn">Free some space before exporting.</Alert>
	<Alert title="Sync failed" tone="danger">The server did not respond. Try again.</Alert>
	<Alert tone="neutral">Plain note without a title.</Alert>
	{#if !shown}
		<Button label="Show again" size="sm" variant="outline" tone="neutral" onclick={() => (shown = true)} />
	{/if}
</div>
