<script lang="ts">
	import Kbd from '../../src/components/Kbd.svelte';
	const SHORTCUTS = [
		['Command palette', 'cmd+k'],
		['Save', 'cmd+s'],
		['Find in page', 'cmd+shift+f'],
		['Send message', 'shift+enter'],
		['Close dialog', 'esc']
	];
</script>

<div style="display: flex; flex-direction: column; gap: 12px">
	{#each SHORTCUTS as [action, keys]}
		<div style="display: flex; flex-direction: row; gap: 16px; align-items: center; justify-content: space-between">
			<div style="color: var(--text-secondary)">{action}</div>
			<Kbd {keys} />
		</div>
	{/each}
	<div style="display: flex; flex-direction: row; gap: 16px; align-items: center">
		<Kbd keys="cmd+k" size="h-sm" />
		<Kbd keys="up" size="h-sm" />
		<Kbd keys="down" size="h-sm" />
	</div>
</div>
