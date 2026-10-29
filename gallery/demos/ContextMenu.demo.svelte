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
		style="height: 150px; align-items: center; justify-content: center; background-color: var(--ui-surface); border-width: 1px; border-color: var(--ui-border); border-radius: var(--ui-radius-lg)"
	>
		<div style="font-size: var(--ui-text-md); color: var(--ui-ink)">Right-click anywhere in this panel</div>
	</ContextMenu>
	<div style="font-size: var(--ui-text-sm); color: var(--ui-ink-muted)">last action: {last}</div>
</div>
