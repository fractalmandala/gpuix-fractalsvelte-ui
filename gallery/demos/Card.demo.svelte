<script lang="ts">
	import Card from '../../src/components/Card.svelte';
	import Button from '../../src/components/Button.svelte';
	let opened = $state(0);
	let starred = $state(false);
</script>

<div style="display: flex; flex-direction: column; gap: 16px">
	<div style="display: flex; flex-direction: row; gap: 16px; align-items: start">
		<div style="flex-grow: 1; flex-basis: 0; min-width: 0">
			<Card title="Project Atlas" description="Edited 2 hours ago">
				Shared with 4 people. Last build passed on main.
				{#snippet footer()}
					<Button label="Cancel" variant="ghost" size="h-md" />
					<Button label="Open" size="h-md" />
				{/snippet}
			</Card>
		</div>
		<div style="flex-grow: 1; flex-basis: 0; min-width: 0">
			<Card title="Quarterly report" description="Draft · 12 pages">
				{#snippet actions()}
					<Button label={starred ? 'Starred' : 'Star'} variant={starred ? 'themed' : 'ghost'} size="h-md" onclick={() => (starred = !starred)} />
				{/snippet}
				Finance numbers are final. Review the summary before sending.
			</Card>
		</div>
	</div>
	<Card title="Compact" description="padding sm" padding="sm">Tight padding.</Card>
	<Card title="Open a workspace" description="Click the card to open it" clickable onclick={() => opened++}>
		<div style="color: var(--text-secondary)">Opened {opened} times.</div>
	</Card>
</div>
