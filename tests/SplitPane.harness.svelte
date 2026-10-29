<script lang="ts">
	import ThemeProvider from '../src/theme/ThemeProvider.svelte';
	import SplitPane from '../src/components/SplitPane.svelte';
	let h = $state(120);
	let v = $state(60);
</script>

<ThemeProvider>
	<div style="display: flex; flex-direction: column; gap: 8px">
		<div testId="readout" style="font-size: 12px">h:{h} v:{v}</div>
		<div style="display: flex; flex-direction: column; height: 170px">
			<SplitPane testid="h" initial={120} minFirst={60} minSecond={60} onresize={(s) => (h = s)}>
				{#snippet first()}<div testId="left" style="background-color: var(--ui-raised); height: 100%">left</div>{/snippet}
				{#snippet second()}<div testId="right" style="background-color: var(--ui-accent-soft)">right</div>{/snippet}
			</SplitPane>
		</div>
		<div style="display: flex; flex-direction: column; height: 170px">
			<SplitPane testid="v" direction="column" initial={60} minFirst={40} minSecond={40} onresize={(s) => (v = s)}>
				{#snippet first()}<div testId="top" style="background-color: var(--ui-raised); height: 100%">top</div>{/snippet}
				{#snippet second()}<div testId="bottom" style="background-color: var(--ui-accent-soft)">bottom</div>{/snippet}
			</SplitPane>
		</div>
	</div>
</ThemeProvider>
