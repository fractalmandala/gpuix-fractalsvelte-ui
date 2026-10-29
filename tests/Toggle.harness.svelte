<script lang="ts">
	import ThemeProvider from '../src/theme/ThemeProvider.svelte';
	import Toggle from '../src/components/Toggle.svelte';
	let bold = $state(false);
	let wrap = $state(false);
	let lock = $state(false);
</script>

<ThemeProvider>
	<div style="display: flex; flex-direction: row; gap: 8px; padding: 16px; align-items: center">
		<Toggle label="Bold" testid="bold" pressed={bold} onchange={(p) => (bold = p)} />
		<Toggle label="Wrap" variant="ghost" tone="success" testid="wrap" pressed={wrap} onchange={(p) => (wrap = p)} />
		<Toggle label="Lock" disabled testid="lock" pressed={lock} onchange={(p) => (lock = p)} />
	</div>
	<div testId="state">bold:{bold} wrap:{wrap} lock:{lock}</div>
</ThemeProvider>
