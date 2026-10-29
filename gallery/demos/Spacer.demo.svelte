<script lang="ts">
	import Spacer from '../../src/components/Spacer.svelte';
	import Box from '../../src/components/Box.svelte';
	import Button from '../../src/components/Button.svelte';
	const title = 'font-size: var(--ui-text-md); font-weight: 600; color: var(--ui-ink)';
	const muted = 'font-size: var(--ui-text-sm); color: var(--ui-ink-muted)';
</script>

<div style="display: flex; flex-direction: column; gap: 16px">
	<Box bg="surface" border radius="md" padding="sm" style="flex-direction: row; gap: 8px; align-items: center">
		<div style="padding: 0 6px; {title}">Atlas</div>
		<Spacer />
		<Button label="Share" variant="ghost" tone="neutral" size="sm" />
		<Button label="Publish" size="sm" />
	</Box>
	<Box bg="surface" border radius="md" padding="md" style="height: 200px; gap: 8px">
		<div style={title}>Invoice #1042</div>
		<div style={muted}>Issued 3 June · Due 17 June</div>
		<Spacer />
		<div style={muted}>Total due</div>
		<div style="font-size: var(--ui-text-2xl); font-weight: 600; color: var(--ui-ink)">$2,480.00</div>
		<div style="display: flex; flex-direction: row; gap: 8px; align-items: center">
			<Spacer />
			<Button label="Pay now" size="sm" />
		</div>
	</Box>
</div>
