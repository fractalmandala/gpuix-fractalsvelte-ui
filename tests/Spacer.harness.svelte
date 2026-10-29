<script lang="ts">
	import ThemeProvider from '../src/theme/ThemeProvider.svelte';
	import Spacer from '../src/components/Spacer.svelte';
	import Box from '../src/components/Box.svelte';
	import Button from '../src/components/Button.svelte';
	let spaced = $state(true);
</script>

<ThemeProvider>
	<div testId="frame" style="display: flex; flex-direction: column; gap: 12px">
		<Button label="Spacer" variant="outline" size="h-md" testid="toggle" onclick={() => (spaced = !spaced)} />
		<div testId="row" style="display: flex; flex-direction: row; gap: 8px">
			<Box bg="raised" testid="start" style="width: 60px; height: 24px" />
			{#if spaced}<Spacer testid="spacer" />{/if}
			<Box bg="raised" testid="end" style="width: 60px; height: 24px" />
		</div>
	</div>
</ThemeProvider>
