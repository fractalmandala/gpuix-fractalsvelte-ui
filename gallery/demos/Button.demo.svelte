<script lang="ts">
	import Button from '../../src/components/Button.svelte';
	let clicks = $state(0);
</script>

<div style="display: flex; flex-direction: column; gap: 32px">
	{#each ['solid', 'soft', 'outline', 'ghost'] as const as variant}
		<div style="display: flex; flex-direction: row; gap: 8px; align-items: center">
			{#each ['accent', 'neutral', 'success', 'warn', 'danger'] as const as tone}
				<Button {variant} {tone} label={tone} onclick={() => clicks++} />
			{/each}
		</div>
	{/each}
	<div style="display: flex; flex-direction: row; gap: 8px; align-items: center">
		<Button size="sm" label="Small" />
		<Button size="md" label="Medium" />
		<Button size="lg" label="Large" />
		<Button label="Disabled" disabled />
		<Button label="Loading" loading />
	</div>
	<div style="display: flex; flex-direction: row; gap: 8px; align-items: center">
		<Button size="md" shape="rect" label="Rect" />
		<Button size="md" shape="min" label="Min" />
		<Button size="md" shape="modern" label="Modern" />
		<Button size="md" shape="curved" label="Curved" />
		<Button size="md" shape="round" label="Round" />
	</div>
	<div style="color: var(--ui-ink-muted)">clicks: {clicks}</div>
</div>
