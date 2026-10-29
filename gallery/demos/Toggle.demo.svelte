<script lang="ts">
	import Toggle from '../../src/components/Toggle.svelte';
	let bold = $state(false);
	let italic = $state(true);
	let wrap = $state(false);
</script>

<div style="display: flex; flex-direction: column; gap: 12px">
	<div style="display: flex; flex-direction: row; gap: 8px; align-items: center">
		<Toggle label="Bold" pressed={bold} onchange={(p) => (bold = p)} />
		<Toggle label="Italic" pressed={italic} onchange={(p) => (italic = p)} tone="neutral" />
		<Toggle label="Wrap" pressed={wrap} onchange={(p) => (wrap = p)} tone="success" variant="ghost" />
		<Toggle label="Locked" pressed disabled tone="danger" />
	</div>
	<div style="display: flex; flex-direction: row; gap: 8px; align-items: center">
		{#each ['accent', 'neutral', 'success', 'warn', 'danger'] as const as tone}
			<Toggle {tone} label={tone} pressed={tone !== 'neutral'} />
		{/each}
	</div>
	<div style="display: flex; flex-direction: row; gap: 8px; align-items: center">
		<Toggle size="sm" label="Small" pressed />
		<Toggle size="md" label="Medium" pressed />
		<Toggle size="lg" label="Large" pressed />
	</div>
	<div style="color: var(--ui-ink-muted)">bold: {bold ? 'on' : 'off'} · italic: {italic ? 'on' : 'off'} · wrap: {wrap ? 'on' : 'off'}</div>
</div>
