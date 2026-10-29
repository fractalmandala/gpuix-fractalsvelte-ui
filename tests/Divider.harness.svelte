<script lang="ts">
	import ThemeProvider from '../src/theme/ThemeProvider.svelte';
	import Divider from '../src/components/Divider.svelte';
	import Button from '../src/components/Button.svelte';
	let label = $state('');
</script>

<ThemeProvider>
	<div testId="frame" style="display: flex; flex-direction: column; gap: 12px; width: 300px">
		<div testId="top" style="height: 20px">Top</div>
		<Divider testid="split" {label} />
		<div testId="row" style="display: flex; flex-direction: row; gap: 12px; height: 40px">
			<div>Left</div>
			<Divider orientation="vertical" testid="vrule" />
			<div>Right</div>
		</div>
		<Button label="Label" variant="outline" size="sm" testid="toggle" onclick={() => (label = label ? '' : 'Section')} />
	</div>
</ThemeProvider>
