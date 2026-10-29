<script lang="ts">
	import ThemeProvider from '../src/theme/ThemeProvider.svelte';
	import Stack from '../src/components/Stack.svelte';
	import Box from '../src/components/Box.svelte';
	import Button from '../src/components/Button.svelte';
	let direction = $state<'row' | 'column'>('row');
	let justify = $state<'start' | 'center'>('start');
	let wrap = $state(false);
</script>

<ThemeProvider>
	<div testId="frame" style="display: flex; flex-direction: column; gap: 12px">
		<div testId="row" style="display: flex; flex-direction: row; gap: 8px">
			<Button label="Flip" variant="outline" size="sm" testid="flip" onclick={() => (direction = direction === 'row' ? 'column' : 'row')} />
			<Button label="Center" variant="outline" size="sm" testid="center" onclick={() => (justify = justify === 'start' ? 'center' : 'start')} />
			<Button label="Wrap" variant="outline" size="sm" testid="wrap" onclick={() => (wrap = !wrap)} />
		</div>
		<Stack {direction} {justify} padding="md" gap="md" testid="stack">
			<Box bg="raised" radius="sm" testid="a" style="width: 60px; height: 24px" />
			<Box bg="raised" radius="sm" testid="b" style="width: 60px; height: 24px" />
			<Box bg="raised" radius="sm" testid="c" style="width: 60px; height: 24px" />
		</Stack>
		<Stack direction="row" {wrap} gap="md" style="width: 130px" testid="wrapper">
			<Box bg="raised" radius="sm" testid="wa" style="width: 60px; height: 24px" />
			<Box bg="raised" radius="sm" testid="wb" style="width: 60px; height: 24px" />
			<Box bg="raised" radius="sm" testid="wc" style="width: 60px; height: 24px" />
		</Stack>
	</div>
</ThemeProvider>
