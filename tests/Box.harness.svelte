<script lang="ts">
	import ThemeProvider from '../src/theme/ThemeProvider.svelte';
	import Box from '../src/components/Box.svelte';
	import Button from '../src/components/Button.svelte';
	let bordered = $state(false);
</script>

<ThemeProvider>
	<div testId="frame" style="display: flex; flex-direction: column; gap: 12px">
		<Button label="Border" variant="outline" size="sm" testid="toggle" onclick={() => (bordered = !bordered)} />
		<Box bg="surface" padding="md" border={bordered} radius="lg" testid="card">
			<div testId="inner" style="height: 20px">Inside</div>
		</Box>
		<Box bg="raised" radius="sm" style="padding: 0" testid="flush">
			<div testId="flat" style="height: 20px">Flat</div>
		</Box>
	</div>
</ThemeProvider>
