<script lang="ts">
	import ScrollArea from '../../src/components/ScrollArea.svelte';
	const rows = Array.from({ length: 20 }, (_, i) => i + 1);
	const caption = 'font-size: var(--ui-text-sm); color: var(--ui-ink-muted); padding-bottom: 6px';
	const frame = 'width: 200px; padding: 8px; background-color: var(--ui-surface); border-width: 1px; border-color: var(--ui-border); border-radius: var(--ui-radius-md)';
	const line = 'font-size: var(--ui-text-md); color: var(--ui-ink)';
</script>

<div style="display: flex; flex-direction: row; gap: 16px; align-items: start">
	<div>
		<div style={caption}>maxHeight 150</div>
		<ScrollArea maxHeight={150} gap={4} style={frame}>
			{#each rows as r (r)}<div style="height: 22px; {line}">Message {r}</div>{/each}
		</ScrollArea>
	</div>
	<div>
		<div style={caption}>fixed height 150</div>
		<ScrollArea height={150} gap={4} style={frame}>
			{#each rows as r (r)}<div style="height: 22px; {line}">Track {r}</div>{/each}
		</ScrollArea>
	</div>
	<div>
		<div style={caption}>short, shrinks to content</div>
		<ScrollArea maxHeight={150} gap={4} style={frame}>
			<div style="height: 22px; {line}">Only item</div>
			<div style="height: 22px; {line}">Second item</div>
		</ScrollArea>
	</div>
</div>
