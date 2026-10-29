<script lang="ts">
	import ThemeProvider from '../src/theme/ThemeProvider.svelte';
	import ScrollArea from '../src/components/ScrollArea.svelte';
	const rows = Array.from({ length: 20 }, (_, i) => i);
</script>

<ThemeProvider>
	<div style="display: flex; flex-direction: column; gap: 8px; width: 300px">
		<ScrollArea testid="long" maxHeight={120}>
			{#each rows as r}<div style="height: 20px">row {r}</div>{/each}
		</ScrollArea>
		<ScrollArea testid="short" maxHeight={120}>
			<div style="height: 20px">one</div>
			<div style="height: 20px">two</div>
		</ScrollArea>
		<ScrollArea testid="fixed" height={80}>
			{#each rows as r}<div style="height: 20px">item {r}</div>{/each}
		</ScrollArea>
	</div>
</ThemeProvider>
