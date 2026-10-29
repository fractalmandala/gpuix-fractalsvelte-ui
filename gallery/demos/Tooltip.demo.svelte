<script lang="ts">
	import Tooltip from '../../src/components/Tooltip.svelte';
	const trigger = 'padding: 6px 12px; border-radius: var(--ui-radius-sm); background-color: var(--ui-raised); color: var(--ui-ink); font-size: var(--ui-text-md)';
	const hover = 'background-color: var(--ui-border)';
	const caption = 'font-size: var(--ui-text-sm); color: var(--ui-ink-muted)';
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
