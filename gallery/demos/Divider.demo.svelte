<script lang="ts">
	import Divider from '../../src/components/Divider.svelte';
	const body = 'font-size: var(--text-md); color: var(--text-primary)';
	const muted = 'font-size: var(--text-sm); color: var(--text-secondary)';
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
