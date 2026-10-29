<script lang="ts">
	import Alert from '../src/components/Alert.svelte';
	import Button from '../src/components/Button.svelte';
	let saved = $state(true);
	let warned = $state(true);
</script>

<div style="display: flex; flex-direction: column; gap: 12px; padding: 16px">
	{#if saved}
		<Alert title="Saved" variant="success" testid="saved" onclose={() => (saved = false)}>Your changes are live.</Alert>
	{/if}
	{#if warned}
		<Alert title="Disk almost full" variant="warning" testid="warn" onclose={() => (warned = false)}>Free some space before exporting.</Alert>
	{/if}
	<Alert variant="danger" testid="err">Sync failed: the server did not respond.</Alert>
	<div style="display: flex; flex-direction: row; gap: 8px">
		<Button label="Restore" size="h-md" variant="outline" testid="restore" onclick={() => { saved = true; warned = true; }} />
	</div>
</div>
