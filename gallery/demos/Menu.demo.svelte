<script lang="ts">
	import Menu from '../../src/components/Menu.svelte';
	import Button from '../../src/components/Button.svelte';
	let open = $state(false);
	let picked = $state('nothing');
	const pick = (name: string) => () => (picked = name);
</script>

<div style="display: flex; flex-direction: column; gap: 12px">
	<div style="display: flex; flex-direction: row; gap: 24px; align-items: start">
		<Menu
			{open}
			onopenchange={(o) => (open = o)}
			style="min-width: 220px"
			items={[
				{ label: 'Rename', shortcut: '⌘R', onselect: pick('Rename') },
				{ label: 'Duplicate', shortcut: '⌘D', onselect: pick('Duplicate') },
				{ label: 'Share…', onselect: pick('Share') },
				{ separator: true },
				{ label: 'Archive', disabled: true, onselect: pick('Archive') },
				{ label: 'Delete', shortcut: '⌫', tone: 'danger', onselect: pick('Delete') }
			]}
		>
			{#snippet trigger()}<Button label="Actions" variant="outline" tone="neutral" />{/snippet}
		</Menu>
		<div style="color: var(--ui-ink-muted); padding-top: 8px">picked: {picked}</div>
	</div>
</div>
