<script lang="ts">
	import ThemeProvider from '../src/theme/ThemeProvider.svelte';
	import Card from '../src/components/Card.svelte';
	import Button from '../src/components/Button.svelte';
	let opened = $state(0);
	let starred = $state(0);
	let footed = $state(0);
	let static_hits = $state(0);
</script>

<ThemeProvider>
	<div style="display: flex; flex-direction: column; gap: 12px; width: 320px">
		<Card testid="card" title="Project" description="Last edited 2h ago" clickable onclick={() => opened++}>
			{#snippet actions()}
				<Button label="Star" variant="ghost" tone="neutral" size="sm" testid="star" onclick={() => starred++} />
			{/snippet}
			Body copy for the card.
			{#snippet footer()}
				<Button label="Open" size="sm" testid="open" onclick={() => footed++} />
			{/snippet}
		</Card>
		<Card testid="static" title="Static" onclick={() => static_hits++}>Not clickable.</Card>
		<div testId="counts">{opened}/{starred}/{footed}/{static_hits}</div>
	</div>
</ThemeProvider>
