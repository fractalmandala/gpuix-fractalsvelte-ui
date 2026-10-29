<script lang="ts">
	import ThemeProvider from '../src/theme/ThemeProvider.svelte';
	import Spinner from '../src/components/Spinner.svelte';
	import Button from '../src/components/Button.svelte';
	let show = $state(true);
</script>

<ThemeProvider>
	<div style="display: flex; flex-direction: column; gap: 16px; padding: 16px">
		<div style="display: flex; flex-direction: row; gap: 20px; align-items: center">
			<Spinner size="sm" testid="sp-sm" />
			<Spinner testid="sp-md" />
			<Spinner size="lg" tone="success" testid="sp-lg" />
			<Spinner size="lg" tone="neutral" testid="sp-neutral" />
		</div>
		<div style="display: flex; flex-direction: row; gap: 8px; align-items: center">
			<Button label={show ? 'Hide' : 'Show'} size="sm" variant="outline" tone="neutral" testid="toggle" onclick={() => (show = !show)} />
			{#if show}<Spinner testid="live" />{/if}
		</div>
	</div>
</ThemeProvider>
