<script lang="ts">
	import ThemeProvider from '../src/theme/ThemeProvider.svelte';
	import Progress from '../src/components/Progress.svelte';
	import Button from '../src/components/Button.svelte';
	let value = $state(40);
</script>

<ThemeProvider>
	<div style="display: flex; flex-direction: column; gap: 14px; padding: 16px; width: 420px">
		<div style="display: flex; flex-direction: row; gap: 8px; align-items: center">
			<Button label="-10" size="sm" variant="outline" tone="neutral" testid="dec" onclick={() => (value = Math.max(0, value - 10))} />
			<Button label="+10" size="sm" variant="outline" tone="neutral" testid="inc" onclick={() => (value = Math.min(100, value + 10))} />
			<div testId="value">{value}%</div>
		</div>
		<Progress {value} testid="p" />
		<Progress {value} tone="success" size="sm" />
		<Progress {value} tone="warn" size="lg" />
		<Progress indeterminate tone="neutral" testid="ind" />
	</div>
</ThemeProvider>
