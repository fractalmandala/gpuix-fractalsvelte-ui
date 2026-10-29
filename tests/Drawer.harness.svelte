<script lang="ts">
	import ThemeProvider from '../src/theme/ThemeProvider.svelte';
	import Button from '../src/components/Button.svelte';
	import Drawer from '../src/components/Drawer.svelte';

	type Side = 'left' | 'right' | 'bottom';
	let open = $state(false);
	let side = $state<Side>('right');
	let applied = $state(0);

	const show = (s: Side) => {
		side = s;
		open = true;
	};
</script>

<ThemeProvider>
	<div style="display: flex; flex-direction: row; gap: 8px; padding: 16px">
		<Button label="Left" variant="outline" testid="left" onclick={() => show('left')} />
		<Button label="Right" testid="right" onclick={() => show('right')} />
		<Button label="Bottom" variant="outline" testid="bottom" onclick={() => show('bottom')} />
	</div>
	<div testId="count">applied:{applied}</div>
	<Drawer {open} {side} size="sm" title="Settings" testid="d" onclose={() => (open = false)}>
		<div testId="inside">Drawer body text</div>
		{#snippet footer()}
			<Button label="Cancel" variant="ghost" onclick={() => (open = false)} />
			<Button label="Apply" testid="apply" onclick={() => { applied++; open = false; }} />
		{/snippet}
	</Drawer>
</ThemeProvider>
