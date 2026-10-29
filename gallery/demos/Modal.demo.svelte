<script lang="ts">
	import Button from '../../src/components/Button.svelte';
	import Modal from '../../src/components/Modal.svelte';
	let open = $state(false);
</script>

<div style="display: flex; flex-direction: row">
	<Button label="Open modal" onclick={() => (open = true)} />
</div>
<Modal {open} onclose={() => (open = false)} title="Publish changes?">
	Your edits will be visible to everyone with access.
	{#snippet footer()}
		<Button label="Cancel" variant="ghost" tone="neutral" onclick={() => (open = false)} />
		<Button label="Publish" onclick={() => (open = false)} />
	{/snippet}
</Modal>
