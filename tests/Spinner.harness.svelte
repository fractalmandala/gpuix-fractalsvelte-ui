<script lang="ts">
	import ThemeProvider from '../src/theme/ThemeProvider.svelte';
	import Spinner from '../src/components/Spinner.svelte';
	import Button from '../src/components/Button.svelte';
	let show = $state(true);
</script>

<ThemeProvider>
	<div style="display: flex; flex-direction: column; gap: 16px; padding: 16px">
		<div style="display: flex; flex-direction: row; gap: 20px; align-items: center">
			<Spinner size="h-sm" testid="sp-sm" />
			<Spinner testid="sp-md" />
			<Spinner size="h-lg" variant="success" testid="sp-lg" />
			<Spinner size="h-lg" variant="secondary" testid="sp-neutral" />
		</div>
		<div style="display: flex; flex-direction: row; gap: 8px; align-items: center">
			<Button label={show ? 'Hide' : 'Show'} size="h-sm" variant="outline" testid="toggle" onclick={() => (show = !show)} />
			{#if show}<Spinner testid="live" />{/if}
		</div>
	</div>
</ThemeProvider>
