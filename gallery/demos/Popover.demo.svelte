<script lang="ts">
	import Button from '../../src/components/Button.svelte';
	import Popover from '../../src/components/Popover.svelte';
	let which = $state<'actions' | 'share' | 'sort' | null>(null);
	let last = $state('none');
	let pinned = $state<{ x: number; y: number } | null>(null);
	const choose = (name: string) => {
		last = name;
		which = null;
	};
	const row = 'padding: 6px 10px; border-radius: var(--radius-sm); color: var(--text-primary); font-size: var(--text-md)';
</script>

<div style="display: flex; flex-direction: column; gap: 16px">
	<div style="display: flex; flex-direction: row; gap: 12px; align-items: start">
		<Popover open={which === 'actions'} onclose={() => (which = null)}>
			<Button label="Actions" variant="outline" onclick={() => (which = which === 'actions' ? null : 'actions')} />
			{#snippet content()}
				<div style={row} hover="background-color: var(--bg-raised)" onclick={() => choose('Rename')}>Rename</div>
				<div style={row} hover="background-color: var(--bg-raised)" onclick={() => choose('Duplicate')}>Duplicate</div>
				<div style={row} hover="background-color: var(--bg-raised)" onclick={() => choose('Move to…')}>Move to…</div>
			{/snippet}
		</Popover>
		<Popover open={which === 'share'} onclose={() => (which = null)} side="right" align="start">
			<Button label="Share" variant="themed" onclick={() => (which = which === 'share' ? null : 'share')} />
			{#snippet content()}
				<div style="display: flex; flex-direction: column; gap: 8px; padding: 6px; width: 200px">
					<div style="font-size: var(--text-md); font-weight: 600; color: var(--text-primary)">Share link</div>
					<div style="font-size: var(--text-sm); color: var(--text-secondary)">Anyone with the link can view.</div>
					<Button label="Copy link" size="h-md" full onclick={() => choose('Copied link')} />
				</div>
			{/snippet}
		</Popover>
		<Popover open={which === 'sort'} onclose={() => (which = null)} side="top" align="end">
			<Button label="Sort" variant="secondary" onclick={() => (which = which === 'sort' ? null : 'sort')} />
			{#snippet content()}
				<div style={row} hover="background-color: var(--bg-raised)" onclick={() => choose('Name')}>Name</div>
				<div style={row} hover="background-color: var(--bg-raised)" onclick={() => choose('Date modified')}>Date modified</div>
				<div style={row} hover="background-color: var(--bg-raised)" onclick={() => choose('Size')}>Size</div>
			{/snippet}
		</Popover>
	</div>
	<div style="display: flex; flex-direction: row; gap: 12px; align-items: start">
		<Popover open={pinned !== null} onclose={() => (pinned = null)} position={pinned}>
			<Button label="Panel at the pointer" variant="secondary" onclick={(e) => (pinned = pinned ? null : { x: e.x ?? 0, y: e.y ?? 0 })} />
			{#snippet content()}<div style={row} onclick={() => choose('Pinned item')}>Pinned at the click</div>{/snippet}
		</Popover>
	</div>
	<div style="font-size: var(--text-sm); color: var(--text-secondary)">last choice: {last}</div>
</div>
