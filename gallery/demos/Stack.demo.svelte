<script lang="ts">
	import Stack from '../../src/components/Stack.svelte';
	import Box from '../../src/components/Box.svelte';
	import Button from '../../src/components/Button.svelte';
	const chip = 'font-size: var(--text-sm); color: var(--text-primary)';
	const caption = 'font-size: var(--text-sm); color: var(--text-secondary)';
	const tags = ['Design', 'Svelte', 'GPUI', 'Rust', 'Motion', 'Tokens', 'Docs'];
	let justify = $state<'start' | 'center' | 'between'>('between');
</script>

<div style="display: flex; flex-direction: column; gap: 18px">
	<div style="display: flex; flex-direction: column; gap: 8px">
		<div style={caption}>Row, gap md, align center</div>
		<Stack direction="row" gap="md" align="center">
			{#each tags.slice(0, 3) as t (t)}
				<Box bg="raised" radius="sm" padding={6}><div style={chip}>{t}</div></Box>
			{/each}
		</Stack>
	</div>
	<div style="display: flex; flex-direction: column; gap: 8px">
		<div style={caption}>Row, justify {justify} (click to cycle)</div>
		<Stack direction="row" justify={justify} align="center" gap="sm" style="padding: 10px; background-color: var(--bg-surface); border-width: 1px; border-color: var(--border); border-radius: var(--radius-md)">
			<div style="font-size: var(--text-md); font-weight: 600; color: var(--text-primary)">Toolbar</div>
			<Button label="Cycle" variant="outline" size="h-md" onclick={() => (justify = justify === 'between' ? 'center' : justify === 'center' ? 'start' : 'between')} />
		</Stack>
	</div>
	<div style="display: flex; flex-direction: row; gap: 24px; align-items: start">
		<div style="display: flex; flex-direction: column; gap: 8px; flex-grow: 1">
			<div style={caption}>Column, gap sm</div>
			<Stack direction="column" gap="sm">
				<Box bg="raised" radius="sm" padding="sm"><div style={chip}>Step one</div></Box>
				<Box bg="raised" radius="sm" padding="sm"><div style={chip}>Step two</div></Box>
				<Box bg="raised" radius="sm" padding="sm"><div style={chip}>Step three</div></Box>
			</Stack>
		</div>
		<div style="display: flex; flex-direction: column; gap: 8px; width: 200px">
			<div style={caption}>Wrap in 200px</div>
			<Stack direction="row" wrap gap="sm">
				{#each tags as t (t)}
					<Box bg="raised" radius="sm" padding={6}><div style={chip}>{t}</div></Box>
				{/each}
			</Stack>
		</div>
	</div>
</div>
