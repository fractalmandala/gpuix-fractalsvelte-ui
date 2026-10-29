<script lang="ts">
	import Tooltip from '../../src/components/Tooltip.svelte';
	const trigger = 'padding: 6px 12px; border-radius: var(--radius-sm); background-color: var(--bg-raised); color: var(--text-primary); font-size: var(--text-md)';
	const hover = 'background-color: var(--border)';
	const caption = 'font-size: var(--text-sm); color: var(--text-secondary)';
</script>

<div style="display: flex; flex-direction: column; gap: 24px; padding-top: 44px">
	<div style="display: flex; flex-direction: row; gap: 16px; align-items: center; justify-content: center">
		{#each ['top', 'right', 'bottom', 'left'] as const as side}
			<Tooltip content={`Shown on the ${side}`} {side} delay={150}>
				{#snippet children(h)}
					<div {...h} style={trigger} {hover}>{side}</div>
				{/snippet}
			</Tooltip>
		{/each}
	</div>
	<div style="display: flex; flex-direction: row; gap: 16px; align-items: center">
		<Tooltip content="Save (⌘S)" delay={150}>
			{#snippet children(h)}
				<div {...h} style={trigger} {hover}>Save</div>
			{/snippet}
		</Tooltip>
		<Tooltip content="Forced open" open={true} side="bottom">
			{#snippet children(h)}
				<div {...h} style={trigger} {hover}>Pinned</div>
			{/snippet}
		</Tooltip>
		<div style={caption}>Hover the buttons. "Pinned" is forced open.</div>
	</div>
</div>
