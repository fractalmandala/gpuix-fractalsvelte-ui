<script lang="ts">
	import Box from '../../src/components/Box.svelte';
	const caption = 'font-size: var(--text-sm); color: var(--text-secondary)';
	const chip = 'padding: 4px 8px; border-radius: var(--radius-sm); background-color: var(--theme-color-sub); font-size: var(--text-sm); color: var(--theme-color)';
</script>

<div style="display: flex; flex-direction: column; gap: 20px">
	<div style="display: flex; flex-direction: column; gap: 8px">
		<div style={caption}>Background</div>
		<div style="display: flex; flex-direction: row; gap: 12px">
			<Box bg="none" padding="md" border style="flex-grow: 1"><div style={caption}>none</div></Box>
			<Box bg="surface" padding="md" border style="flex-grow: 1"><div style={caption}>surface</div></Box>
			<Box bg="raised" padding="md" style="flex-grow: 1"><div style={caption}>raised</div></Box>
		</div>
	</div>
	<div style="display: flex; flex-direction: column; gap: 8px">
		<div style={caption}>Radius</div>
		<div style="display: flex; flex-direction: row; gap: 12px">
			{#each ['none', 'sm', 'md', 'lg'] as const as radius}
				<Box bg="raised" padding="sm" {radius} border style="flex-grow: 1; height: 44px; align-items: center; justify-content: center">
					<div style={caption}>{radius}</div>
				</Box>
			{/each}
		</div>
	</div>
	<div style="display: flex; flex-direction: column; gap: 8px">
		<div style={caption}>Padding</div>
		<div style="display: flex; flex-direction: row; gap: 12px; align-items: start">
			<Box bg="surface" padding="sm" border><div style={chip}>sm</div></Box>
			<Box bg="surface" padding="md" border><div style={chip}>md</div></Box>
			<Box bg="surface" padding="lg" border><div style={chip}>lg</div></Box>
			<Box bg="surface" padding={20} border><div style={chip}>20px</div></Box>
		</div>
	</div>
</div>
