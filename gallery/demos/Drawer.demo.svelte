<script lang="ts">
	import Button from '../../src/components/Button.svelte';
	import Drawer from '../../src/components/Drawer.svelte';
	type Side = 'left' | 'right' | 'bottom';
	let open = $state(false);
	let side = $state<Side>('right');
	let size = $state<'sm' | 'md' | 'lg'>('sm');
	let applied = $state(0);
	const show = (s: Side) => {
		side = s;
		open = true;
	};
</script>

<div style="display: flex; flex-direction: column; gap: 12px">
	<div style="display: flex; flex-direction: row; gap: 8px; align-items: center">
		<Button label="Left" variant="outline" tone="neutral" onclick={() => show('left')} />
		<Button label="Right" onclick={() => show('right')} />
		<Button label="Bottom" variant="outline" tone="neutral" onclick={() => show('bottom')} />
		<div style="flex-grow: 1"></div>
		<div style="font-size: var(--ui-text-sm); color: var(--ui-ink-muted)">applied {applied}×</div>
	</div>
	<div style="font-size: var(--ui-text-sm); color: var(--ui-ink-muted)">Size for left and right drawers: sm, md, lg. Escape or a scrim click closes.</div>
	<div style="display: flex; flex-direction: row; gap: 8px">
		{#each ['sm', 'md', 'lg'] as const as s}
			<Button label={s} size="sm" variant={size === s ? 'solid' : 'outline'} tone="neutral" onclick={() => (size = s)} />
		{/each}
	</div>
	<Drawer {open} {side} {size} title="Settings" onclose={() => (open = false)}>
		<div style="font-size: var(--ui-text-md); color: var(--ui-ink)">Workspace</div>
		<div>Choose the defaults used for new projects, including the theme, font size and autosave interval.</div>
		<div>Changes apply to every window once you press Apply.</div>
		{#snippet footer()}
			<Button label="Cancel" variant="ghost" tone="neutral" onclick={() => (open = false)} />
			<Button label="Apply" onclick={() => { applied++; open = false; }} />
		{/snippet}
	</Drawer>
</div>
