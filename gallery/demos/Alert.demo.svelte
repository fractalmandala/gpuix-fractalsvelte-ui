<script lang="ts">
	import Alert from '../../src/components/Alert.svelte';
	import Button from '../../src/components/Button.svelte';
	let shown = $state(true);
</script>

<div style="display: flex; flex-direction: column; gap: 12px; max-width: 460px">
	{#if shown}
		<Alert title="Export complete" variant="success" onclose={() => (shown = false)}>Saved 12 files to ~/Documents/export.</Alert>
	{/if}
	<Alert title="Update available" variant="info">Version 1.4 adds faster search.</Alert>
	<Alert title="Disk almost full" variant="warning">Free some space before exporting.</Alert>
	<Alert title="Sync failed" variant="danger">The server did not respond. Try again.</Alert>
	<Alert variant="secondary">Plain note without a title.</Alert>
	{#if !shown}
		<Button label="Show again" size="h-md" variant="outline" onclick={() => (shown = true)} />
	{/if}
</div>
