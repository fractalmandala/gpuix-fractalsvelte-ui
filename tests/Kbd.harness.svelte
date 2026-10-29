<script lang="ts">
	import { on_window_key } from 'gpuix-fractalsvelte';
	import ThemeProvider from '../src/theme/ThemeProvider.svelte';
	import Kbd from '../src/components/Kbd.svelte';
	let saved = $state(0);

	$effect(() =>
		on_window_key('keydown', (e) => {
			if (e.modifiers!.cmd && e.key === 'k') saved++;
		})
	);
</script>

<ThemeProvider>
	<div style="display: flex; flex-direction: column; gap: 14px; padding: 16px">
		<div style="display: flex; flex-direction: row; gap: 12px; align-items: center">
			<div>Command palette</div>
			<Kbd keys="cmd+k" testid="palette" />
		</div>
		<div style="display: flex; flex-direction: row; gap: 12px; align-items: center">
			<div>Send message</div>
			<Kbd keys="shift+enter" size="sm" />
		</div>
		<div testId="saved">saved:{saved}</div>
	</div>
</ThemeProvider>
