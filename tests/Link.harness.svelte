<script lang="ts">
	import ThemeProvider from '../src/theme/ThemeProvider.svelte';
	import Link from '../src/components/Link.svelte';
	let clicks = $state(0);
	let last = $state('none');
</script>

<ThemeProvider>
	<div style="display: flex; flex-direction: column; gap: 12px; padding: 16px">
		<div style="display: flex; flex-direction: row; gap: 16px; align-items: center">
			<Link label="Docs" testid="docs" onclick={() => { clicks++; last = 'docs'; }} />
			<Link variant="danger" label="Delete" testid="del" onclick={() => { clicks++; last = 'del'; }} />
			<Link variant="secondary" label="Off" disabled testid="off" onclick={() => { clicks++; last = 'off'; }} />
		</div>
		<Link size="h-sm" testid="more" onclick={() => { clicks++; last = 'more'; }}>
			{#snippet children()}Read more →{/snippet}
		</Link>
	</div>
	<div testId="state">last:{last} clicks:{clicks}</div>
</ThemeProvider>
