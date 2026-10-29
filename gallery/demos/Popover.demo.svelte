<script lang="ts">
	import Button from '../../src/components/Button.svelte';
	import Popover from '../../src/components/Popover.svelte';
	let which = $state<'actions' | 'share' | 'sort' | null>(null);
	let last = $state('none');
	const choose = (name: string) => {
		last = name;
		which = null;
	};
	const row = 'padding: 6px 10px; border-radius: var(--ui-radius-sm); color: var(--ui-ink); font-size: var(--ui-text-md)';
</script>

<div style="display: flex; flex-direction: column; gap: 16px">
	<div style="display: flex; flex-direction: row; gap: 12px; align-items: start">
		<Popover open={which === 'actions'} onclose={() => (which = null)}>
			<Button label="Actions" variant="outline" tone="neutral" onclick={() => (which = which === 'actions' ? null : 'actions')} />
			{#snippet content()}
				<div style={row} hover="background-color: var(--ui-raised)" onclick={() => choose('Rename')}>Rename</div>
				<div style={row} hover="background-color: var(--ui-raised)" onclick={() => choose('Duplicate')}>Duplicate</div>
				<div style={row} hover="background-color: var(--ui-raised)" onclick={() => choose('Move to…')}>Move to…</div>
			{/snippet}
		</Popover>
		<Popover open={which === 'share'} onclose={() => (which = null)} side="right" align="start">
			<Button label="Share" tone="accent" onclick={() => (which = which === 'share' ? null : 'share')} />
			{#snippet content()}
				<div style="display: flex; flex-direction: column; gap: 8px; padding: 6px; width: 200px">
					<div style="font-size: var(--ui-text-md); font-weight: 600; color: var(--ui-ink)">Share link</div>
					<div style="font-size: var(--ui-text-sm); color: var(--ui-ink-muted)">Anyone with the link can view.</div>
					<Button label="Copy link" size="sm" full onclick={() => choose('Copied link')} />
				</div>
			{/snippet}
		</Popover>
		<Popover open={which === 'sort'} onclose={() => (which = null)} side="top" align="end">
			<Button label="Sort" variant="soft" tone="neutral" onclick={() => (which = which === 'sort' ? null : 'sort')} />
			{#snippet content()}
				<div style={row} hover="background-color: var(--ui-raised)" onclick={() => choose('Name')}>Name</div>
				<div style={row} hover="background-color: var(--ui-raised)" onclick={() => choose('Date modified')}>Date modified</div>
				<div style={row} hover="background-color: var(--ui-raised)" onclick={() => choose('Size')}>Size</div>
			{/snippet}
		</Popover>
	</div>
	<div style="font-size: var(--ui-text-sm); color: var(--ui-ink-muted)">last choice: {last}</div>
</div>
