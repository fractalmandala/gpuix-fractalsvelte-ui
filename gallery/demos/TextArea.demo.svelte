<script lang="ts">
	import TextArea from '../../src/components/TextArea.svelte';
	let notes = $state('');
</script>

<div style="display: flex; flex-direction: column; gap: 16px; width: 360px">
	<TextArea
		label="Notes"
		placeholder="Write freely. The field grows with the text."
		hint="Enter adds a line"
		value={notes}
		onchange={(v) => (notes = v)}
		maxRows={6}
	/>
	<div style="color: var(--ui-ink-muted); font-size: var(--ui-text-sm)">{notes.length} characters</div>

	<TextArea size="sm" rows={2} placeholder="Small, two rows" />
	<TextArea size="lg" rows={2} placeholder="Large, two rows" />
	<TextArea label="Summary" value="This copy is too long for the field." error="Keep it under 120 characters" />
	<TextArea label="Changelog" value="Locked for the release." rows={2} disabled />
</div>
