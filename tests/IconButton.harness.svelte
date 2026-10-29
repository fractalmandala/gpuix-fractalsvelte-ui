<script lang="ts">
	import ThemeProvider from '../src/theme/ThemeProvider.svelte';
	import IconButton from '../src/components/IconButton.svelte';
	let count = $state(0);
	let closed = $state(0);
</script>

<ThemeProvider>
	<div style="display: flex; flex-direction: row; gap: 8px; padding: 16px; align-items: center">
		<IconButton glyph="+" label="Add" testid="plus" onclick={() => count++} />
		<IconButton glyph="−" label="Disabled" disabled testid="off" onclick={() => (count += 100)} />
		<IconButton label="Close" variant="outline" testid="close" onclick={() => closed++}>
			{#snippet children()}✕{/snippet}
		</IconButton>
	</div>
	<div testId="count">count:{count} closed:{closed}</div>
</ThemeProvider>
