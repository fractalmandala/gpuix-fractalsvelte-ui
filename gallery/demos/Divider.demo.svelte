<script lang="ts">
	import Divider from '../../src/components/Divider.svelte';
	const body = 'font-size: var(--ui-text-md); color: var(--ui-ink)';
	const muted = 'font-size: var(--ui-text-sm); color: var(--ui-ink-muted)';
</script>

<div style="display: flex; flex-direction: column; gap: 12px; width: 360px">
	<div style={body}>Profile</div>
	<Divider />
	<div style={muted}>Name, email and avatar.</div>
	<Divider label="Advanced" />
	<div style="display: flex; flex-direction: row; gap: 12px; align-items: center; height: 32px">
		<div style={body}>Left</div>
		<Divider orientation="vertical" />
		<div style={body}>Centre</div>
		<Divider orientation="vertical" />
		<div style={body}>Right</div>
	</div>
	<Divider label="Danger zone" />
	<div style={muted}>Deleting a workspace cannot be undone.</div>
</div>
