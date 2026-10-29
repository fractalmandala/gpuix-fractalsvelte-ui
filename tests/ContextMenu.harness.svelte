<script lang="ts">
	import ContextMenu, { type MenuEntry } from '../src/components/ContextMenu.svelte';

	let log = $state('none');
	const items: MenuEntry[] = [
		{ label: 'Copy', onselect: () => (log = 'copy') },
		{ label: 'Paste', onselect: () => (log = 'paste') },
		{ separator: true },
		{ label: 'Locked', disabled: true, onselect: () => (log = 'locked') },
		{ label: 'Delete', danger: true, onselect: () => (log = 'delete') }
	];
</script>

	<div style="display: flex; flex-direction: column; gap: 8px; padding: 16px">
		<ContextMenu {items} testid="cm" style="height: 120px; align-items: center; justify-content: center; background-color: var(--bg-surface); border-width: 1px; border-color: var(--border); border-radius: var(--radius-md)">
			<div>Right-click here</div>
		</ContextMenu>
		<div testId="log">{log}</div>
		<div style="height: 120px"></div>
		<ContextMenu {items} testid="edge" style="height: 40px; align-items: center; justify-content: center; background-color: var(--bg-surface); border-width: 1px; border-color: var(--border); border-radius: var(--radius-md)">
			<div>Near the bottom</div>
		</ContextMenu>
	</div>
