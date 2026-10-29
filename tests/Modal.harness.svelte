<script lang="ts">
	import ThemeProvider from '../src/theme/ThemeProvider.svelte';
	import Button from '../src/components/Button.svelte';
	import Modal from '../src/components/Modal.svelte';
	let open = $state(false);
	let confirmed = $state(0);
</script>

<ThemeProvider>
	<div style="padding: 16px; gap: 8px; display: flex; flex-direction: column">
		<Button label="Open" testid="open" onclick={() => (open = true)} />
		<div>confirmed:{confirmed}</div>
	</div>
	<Modal {open} onclose={() => (open = false)} title="Delete file?" size="sm" testid="m">
		<div testId="inside">This cannot be undone.</div>
		{#snippet footer()}
			<Button label="Cancel" variant="ghost" tone="neutral" onclick={() => (open = false)} />
			<Button label="Delete" tone="danger" testid="confirm" onclick={() => { confirmed++; open = false; }} />
		{/snippet}
	</Modal>
</ThemeProvider>
