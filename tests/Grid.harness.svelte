<script lang="ts">
	import ThemeProvider from '../src/theme/ThemeProvider.svelte';
	import Grid from '../src/components/Grid.svelte';
	import Box from '../src/components/Box.svelte';
	import Button from '../src/components/Button.svelte';
	let columns = $state(3);
</script>

<ThemeProvider>
	<div testId="frame" style="display: flex; flex-direction: column; gap: 12px">
		<Button label="Toggle columns" variant="outline" size="sm" testid="toggle" onclick={() => (columns = columns === 3 ? 2 : 3)} />
		<Grid {columns} gap="sm" testid="grid">
			{#each [0, 1, 2, 3, 4, 5] as i}
				<Box bg="raised" radius="sm" testid={`c${i}`} style="height: 24px" />
			{/each}
		</Grid>
	</div>
</ThemeProvider>
