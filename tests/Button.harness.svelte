<script lang="ts">
	import Button from '../src/components/Button.svelte';
	let count = $state(0);
</script>

<div style="display: flex; flex-direction: row; gap: 8px; padding: 16px">
	<Button label="Add" testid="add" onclick={() => count++} />
	<Button label="Off" disabled testid="off" onclick={() => count += 100} />
	<Button label="Busy" loading testid="busy" onclick={() => count += 100} />
	<Button variant="outline" size="h-md" testid="snip">
		{#snippet children()}Snippet{/snippet}
	</Button>
</div>
<div testId="count">count:{count}</div>
