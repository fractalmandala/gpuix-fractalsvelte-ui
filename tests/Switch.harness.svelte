<script lang="ts">
	import ThemeProvider from '../src/theme/ThemeProvider.svelte';
	import Switch from '../src/components/Switch.svelte';
	let notify = $state(false);
	let off_edits = $state(0);
</script>

<ThemeProvider>
	<div style="display: flex; flex-direction: column; gap: 14px; padding: 16px">
		<Switch label="Notifications" checked={notify} onchange={(v) => (notify = v)} testid="notify" />
		<div testId="notify-state">notify:{notify}</div>
		<Switch label="Locked" checked disabled testid="off" onchange={() => off_edits++} />
		<Switch testid="lg">
			{#snippet children()}Snippet label{/snippet}
		</Switch>
		<div testId="off-edits">edits:{off_edits}</div>
	</div>
</ThemeProvider>
