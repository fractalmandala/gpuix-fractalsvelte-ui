<script lang="ts">
	import ContextMenu, { type MenuEntry } from '../../src/components/ContextMenu.svelte';
	let last = $state('none');
	const pick = (name: string) => () => (last = name);
	const items: MenuEntry[] = [
		{ label: 'Cut', onselect: pick('Cut') },
		{ label: 'Copy', onselect: pick('Copy') },
		{ label: 'Paste', onselect: pick('Paste') },
		{ separator: true },
		{ label: 'Rename', onselect: pick('Rename') },
		{ label: 'Duplicate', disabled: true, onselect: pick('Duplicate') },
		{ separator: true },
		{ label: 'Delete', danger: true, onselect: pick('Delete') }
	];
</script>

<div style="display: flex; flex-direction: column; gap: 12px">
	<ContextMenu
		{items}
		style="height: 150px; align-items: center; justify-content: center; background-color: var(--bg-surface); border-width: 1px; border-color: var(--border); border-radius: var(--radius-lg)"
	>
		<div style="font-size: var(--text-md); color: var(--text-primary)">Right-click anywhere in this panel</div>
	</ContextMenu>
	<div style="font-size: var(--text-sm); color: var(--text-secondary)">last action: {last}</div>
</div>
