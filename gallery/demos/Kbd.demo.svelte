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
			<div style="color: var(--ui-ink-muted)">{action}</div>
			<Kbd {keys} />
		</div>
	{/each}
	<div style="display: flex; flex-direction: row; gap: 16px; align-items: center">
		<Kbd keys="cmd+k" size="sm" />
		<Kbd keys="up" size="sm" />
		<Kbd keys="down" size="sm" />
	</div>
</div>
