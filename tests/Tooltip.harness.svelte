<script lang="ts">
	import ThemeProvider from '../src/theme/ThemeProvider.svelte';
	import Tooltip from '../src/components/Tooltip.svelte';
	let clicks = $state(0);
</script>

<ThemeProvider>
	<div style="display: flex; flex-direction: row; gap: 24px; padding: 60px 16px 16px 16px">
		<Tooltip content="Save (cmd-s)" delay={50} side="bottom" testid="save">
			{#snippet children(hover)}
				<div {...hover} onclick={() => clicks++} testId="trigger" style="padding: 6px 12px; border-radius: var(--radius-sm); background-color: var(--bg-raised); color: var(--text-primary)">Save</div>
			{/snippet}
		</Tooltip>
	</div>
	<div testId="clicks">clicks:{clicks}</div>
</ThemeProvider>
