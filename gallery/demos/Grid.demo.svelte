<script lang="ts">
	import Grid from '../../src/components/Grid.svelte';
	import Box from '../../src/components/Box.svelte';
	const metrics = [
		{ label: 'Revenue', value: '$48.2k' },
		{ label: 'Users', value: '1,284' },
		{ label: 'Retention', value: '62%' },
		{ label: 'Latency', value: '84 ms' },
		{ label: 'Errors', value: '0.2%' },
		{ label: 'Uptime', value: '99.98%' }
	];
</script>

<div style="display: flex; flex-direction: column; gap: 20px">
	<Grid columns={3} gap="md">
		{#each metrics as m (m.label)}
			<Box bg="raised" padding="md" radius="md">
				<div style="font-size: var(--text-sm); color: var(--text-secondary)">{m.label}</div>
				<div style="font-size: var(--text-xl); font-weight: 600; color: var(--text-primary)">{m.value}</div>
			</Box>
		{/each}
	</Grid>
	<Grid columns={2} gap="sm">
		{#each ['Inbox', 'Drafts', 'Sent', 'Archive'] as name (name)}
			<Box bg="surface" padding="sm" border radius="sm">
				<div style="padding: 6px 8px; font-size: var(--text-md); color: var(--text-primary)">{name}</div>
			</Box>
		{/each}
	</Grid>
</div>
