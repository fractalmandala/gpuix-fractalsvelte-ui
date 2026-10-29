---
title: SplitPane
description: Two panes divided by a draggable, keyboard-nudgeable grip, side by side or stacked.
category: layout
---

`SplitPane` puts `first` and `second` either side by side (`row`) or stacked (`column`), with a grip between them. Drag the grip, or focus it and press the arrow keys, to resize the first pane.

```svelte
<script>
  import SplitPane from 'gpuix-fractalsvelte-ui/SplitPane.svelte';
  let width = $state(240);
</script>

<div style="height: 400px; display: flex; flex-direction: column">
  <SplitPane initial={240} minFirst={120} minSecond={120} onresize={(s) => (width = s)}>
    {#snippet first()}<div>Sidebar</div>{/snippet}
    {#snippet second()}<div>Editor</div>{/snippet}
  </SplitPane>
</div>

<SplitPane direction="column" initial={160}>
  {#snippet first()}<div>Top</div>{/snippet}
  {#snippet second()}<div>Bottom</div>{/snippet}
</SplitPane>
```

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `first` | `Snippet` | — |   |
| `second` | `Snippet` | — |   |
| `direction` | `'row' \| 'column'` | `'row'` | `row` puts the panes side by side; `column` stacks them. |
| `initial` | `number` | `240` | First pane's size in px at mount. |
| `minFirst` | `number` | `80` |   |
| `minSecond` | `number` | `80` |   |
| `onresize` | `(size: number) => void` | — | Called with the first pane's size in px while it is dragged or nudged with the arrow keys. |
| `style` | `string \| null` | — |   |
| `testid` | `string \| null` | — |   |
## Tokens

`border`, `ring`
## Keyboard

| Key | Action |
| --- | --- |
| Left / Right (`row`) | Move the divider 10 px while the grip is focused |
| Up / Down (`column`) | Move the divider 10 px while the grip is focused |

The grip is focusable (Tab), and its line turns the ring colour while focused or dragged.

## Examples

Every variant, size and state, exactly as the gallery's Demo view renders them.

```svelte
<script lang="ts">
	import SplitPane from 'gpuix-fractalsvelte-ui/SplitPane.svelte';
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
```

## GPUI notes

- GPUI does not capture the pointer. While dragging, an overlay covers the whole split so moves keep arriving, and a move with no button held ends the drag (the release landed elsewhere).
- Sizes are clamped to the split's painted bounds, which GPUI reports after mount. Before that, only `minFirst` applies.
- `initial` is read once, at mount. To set the size from outside, keep it in state and track it through `onresize`.
