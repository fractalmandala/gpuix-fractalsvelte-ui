<script lang="ts">
		import Checkbox from '../src/components/Checkbox.svelte';
	let agree = $state(false);
	let mixed = $state(true);
	let mixed_on = $state(false);
	let off_edits = $state(0);
</script>

	<div style="display: flex; flex-direction: column; gap: 14px; padding: 16px">
		<Checkbox label="Accept terms" checked={agree} onchange={(v) => (agree = v)} testid="agree" />
		<div testId="agree-state">agree:{agree}</div>
		<Checkbox label="Select all" checked={mixed_on} indeterminate={mixed} onchange={(v) => ((mixed = false), (mixed_on = v))} testid="mixed" />
		<div testId="mixed-state">mixed:{mixed}/{mixed_on}</div>
		<Checkbox label="Locked" checked disabled testid="off" onchange={() => off_edits++} />
		<Checkbox size="h-bs" testid="lg">
			{#snippet children()}Snippet label{/snippet}
		</Checkbox>
		<div testId="off-edits">edits:{off_edits}</div>
	</div>
