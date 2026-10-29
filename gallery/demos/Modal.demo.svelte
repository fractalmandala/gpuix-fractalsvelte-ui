<script lang="ts">
	import Button from '../../src/components/Button.svelte';
	import Modal from '../../src/components/Modal.svelte';
	let open = $state(false);
	let small = $state(false);
</script>

<div style="display: flex; flex-direction: row">
	<Button label="Open modal" onclick={() => (open = true)} />
	<Button label="Small, not dismissable" variant="outline" onclick={() => (small = true)} />
</div>
<Modal {open} onclose={() => (open = false)} title="Publish changes?">
	Your edits will be visible to everyone with access.
	{#snippet footer()}
		<Button label="Cancel" variant="ghost" onclick={() => (open = false)} />
		<Button label="Publish" onclick={() => (open = false)} />
	{/snippet}
</Modal>
<Modal open={small} onclose={() => (small = false)} title="Locked" size="sm" dismissable={false}>
	Escape and the scrim do nothing here.
	{#snippet footer()}
		<Button label="Close" onclick={() => (small = false)} />
	{/snippet}
</Modal>
