<script lang="ts">
	import Switch from '../../src/components/Switch.svelte';

	let wifi = $state(true);
	let sync = $state(false);
	let beta = $state(false);
</script>

<div style="display: flex; flex-direction: row; gap: 48px">
	<div style="display: flex; flex-direction: column; gap: 12px">
		<Switch label="Small" size="sm" checked />
		<Switch label="Medium" checked={wifi} onchange={(v) => (wifi = v)} />
		<Switch label="Large" size="lg" checked />
		<Switch label="Disabled" disabled />
		<Switch label="Disabled on" disabled checked />
	</div>

	<div style="display: flex; flex-direction: column; gap: 12px">
		<Switch label="Sync across devices" checked={sync} onchange={(v) => (sync = v)} />
		<Switch label="Join the beta" checked={beta} onchange={(v) => (beta = v)} />
		<div style="color: var(--ui-ink-muted); font-size: var(--ui-text-sm)">
			sync {sync ? 'on' : 'off'} · beta {beta ? 'on' : 'off'}
		</div>
	</div>
</div>
