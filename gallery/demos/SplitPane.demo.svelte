<script lang="ts">
	import SplitPane from '../../src/components/SplitPane.svelte';
	const files = ['index.ts', 'Button.svelte', 'Modal.svelte', 'tokens.ts', 'README.md'];
	const caption = 'font-size: var(--text-sm); color: var(--text-secondary)';
	const pane = 'display: flex; flex-direction: column; flex-grow: 1; background-color: var(--bg-surface); padding: 10px 12px; gap: 4px';
	let width = $state(0);
</script>

<div style="display: flex; flex-direction: column; gap: 12px">
	<div style="display: flex; flex-direction: column; height: 200px; border-width: 1px; border-color: var(--border); border-radius: var(--radius-md)">
		<SplitPane initial={180} minFirst={120} minSecond={160} onresize={(s) => (width = s)}>
			{#snippet first()}
				<div style="{pane}; background-color: var(--bg-raised)">
					<div style="font-size: var(--text-sm); font-weight: 600; color: var(--text-secondary); padding-bottom: 4px">FILES</div>
					{#each files as f (f)}<div style="font-size: var(--text-md); color: var(--text-primary)">{f}</div>{/each}
				</div>
			{/snippet}
			{#snippet second()}
				<div style={pane}>
					<div style="font-size: var(--text-lg); font-weight: 600; color: var(--text-primary)">Button.svelte</div>
					<div style={caption}>Drag the divider, or focus it and use the arrow keys.</div>
				</div>
			{/snippet}
		</SplitPane>
	</div>
	<div style="display: flex; flex-direction: column; height: 150px; border-width: 1px; border-color: var(--border); border-radius: var(--radius-md)">
		<SplitPane direction="column" initial={70} minFirst={50} minSecond={50}>
			{#snippet first()}
				<div style="{pane}; background-color: var(--bg-raised)"><div style="font-size: var(--text-md); color: var(--text-primary)">Input</div></div>
			{/snippet}
			{#snippet second()}
				<div style={pane}><div style="font-size: var(--text-md); color: var(--text-primary)">Output</div></div>
			{/snippet}
		</SplitPane>
	</div>
	<div style={caption}>Top pane width: {width || 180}px</div>
</div>
