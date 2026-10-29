<script lang="ts">
	import Button from '../../src/components/Button.svelte';
	import Drawer from '../../src/components/Drawer.svelte';
	type Side = 'left' | 'right' | 'bottom';
	let open = $state(false);
	let locked = $state(false);
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
		<Button label="Left" variant="outline" onclick={() => show('left')} />
		<Button label="Right" onclick={() => show('right')} />
		<Button label="Bottom" variant="outline" onclick={() => show('bottom')} />
		<Button label="Locked" variant="outline" onclick={() => (locked = true)} />
		<div style="flex-grow: 1"></div>
		<div style="font-size: var(--text-sm); color: var(--text-secondary)">applied {applied}×</div>
	</div>
	<div style="font-size: var(--text-sm); color: var(--text-secondary)">Size for left and right drawers: sm, md, lg. Escape or a scrim click closes.</div>
	<div style="display: flex; flex-direction: row; gap: 8px">
		{#each ['sm', 'md', 'lg'] as const as s}
			<Button label={s} size="h-md" variant={size === s ? 'primary' : 'outline'} onclick={() => (size = s)} />
		{/each}
	</div>
	<Drawer open={locked} side="left" size="sm" title="Locked" dismissable={false} onclose={() => (locked = false)}>
		Escape and the scrim do nothing here.
		{#snippet footer()}<Button label="Close" onclick={() => (locked = false)} />{/snippet}
	</Drawer>
	<Drawer {open} {side} {size} title="Settings" onclose={() => (open = false)}>
		<div style="font-size: var(--text-md); color: var(--text-primary)">Workspace</div>
		<div>Choose the defaults used for new projects, including the theme, font size and autosave interval.</div>
		<div>Changes apply to every window once you press Apply.</div>
		{#snippet footer()}
			<Button label="Cancel" variant="ghost" onclick={() => (open = false)} />
			<Button label="Apply" onclick={() => { applied++; open = false; }} />
		{/snippet}
	</Drawer>
</div>
