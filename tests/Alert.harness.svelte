<script lang="ts">
	import ThemeProvider from '../src/theme/ThemeProvider.svelte';
	import Alert from '../src/components/Alert.svelte';
	import Button from '../src/components/Button.svelte';
	let saved = $state(true);
	let warned = $state(true);
</script>

<ThemeProvider>
	<div style="display: flex; flex-direction: column; gap: 12px; padding: 16px">
		{#if saved}
			<Alert title="Saved" tone="success" testid="saved" onclose={() => (saved = false)}>Your changes are live.</Alert>
		{/if}
		{#if warned}
			<Alert title="Disk almost full" tone="warn" testid="warn" onclose={() => (warned = false)}>Free some space before exporting.</Alert>
		{/if}
		<Alert tone="danger" testid="err">Sync failed: the server did not respond.</Alert>
		<div style="display: flex; flex-direction: row; gap: 8px">
			<Button label="Restore" size="sm" variant="outline" tone="neutral" testid="restore" onclick={() => { saved = true; warned = true; }} />
		</div>
	</div>
</ThemeProvider>
