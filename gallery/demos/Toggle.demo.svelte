<script lang="ts">
	import Toggle from '../../src/components/Toggle.svelte';
	let bold = $state(false);
	let italic = $state(true);
	let wrap = $state(false);
</script>

<div style="display: flex; flex-direction: column; gap: 12px">
	<div style="display: flex; flex-direction: row; gap: 8px; align-items: center">
		<Toggle label="Bold" pressed={bold} onchange={(p) => (bold = p)} />
		<Toggle label="Italic" pressed={italic} onchange={(p) => (italic = p)} pressedVariant="secondary" />
		<Toggle label="Wrap" pressed={wrap} onchange={(p) => (wrap = p)} pressedVariant="success" variant="ghost" />
		<Toggle label="Locked" pressed disabled pressedVariant="danger" />
	</div>
	<div style="display: flex; flex-direction: row; gap: 8px; align-items: center">
		{#each ['themed', 'secondary', 'info', 'success', 'warning', 'danger'] as const as pressedVariant}
			<Toggle pressedVariant={pressedVariant} label={pressedVariant} pressed={pressedVariant !== 'secondary'} />
		{/each}
	</div>
	<div style="display: flex; flex-direction: row; gap: 8px; align-items: center">
		<Toggle size="h-md" label="Small" pressed />
		<Toggle size="h-bs" label="Medium" pressed />
		<Toggle size="h-lg" label="Large" pressed />
	</div>
	<div style="color: var(--text-secondary)">bold: {bold ? 'on' : 'off'} · italic: {italic ? 'on' : 'off'} · wrap: {wrap ? 'on' : 'off'}</div>
</div>
