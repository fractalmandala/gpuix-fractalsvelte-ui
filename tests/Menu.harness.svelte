<script lang="ts">
	import ThemeProvider from '../src/theme/ThemeProvider.svelte';
	import Button from '../src/components/Button.svelte';
	import Menu from '../src/components/Menu.svelte';
	let open = $state(false);
	let more = $state(false);
	let picked = $state('none');
</script>

<ThemeProvider>
	<div style="display: flex; flex-direction: row; gap: 24px; padding: 16px">
		<Menu
			{open}
			onopenchange={(o) => (open = o)}
			testid="menu"
			items={[
				{ label: 'Rename', shortcut: '⌘R', onselect: () => (picked = 'rename') },
				{ label: 'Duplicate', shortcut: '⌘D', onselect: () => (picked = 'duplicate') },
				{ separator: true },
				{ label: 'Archive', disabled: true, onselect: () => (picked = 'archive') },
				{ label: 'Delete', variant: 'danger', onselect: () => (picked = 'delete') }
			]}
		>
			{#snippet trigger()}<div>Actions</div>{/snippet}
		</Menu>
		<Menu
			open={more}
			onopenchange={(o) => (more = o)}
			testid="more"
			items={[{ label: 'Copy link', onselect: () => (picked = 'copy') }]}
		>
			{#snippet trigger()}<Button label="More" variant="outline" size="h-md" />{/snippet}
		</Menu>
	</div>
	<div testId="state">{`picked:${picked} open:${open}`}</div>
</ThemeProvider>
