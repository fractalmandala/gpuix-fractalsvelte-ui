<script lang="ts">
	import ThemeProvider from '../src/theme/ThemeProvider.svelte';
	import TextArea from '../src/components/TextArea.svelte';
	let notes = $state('');
	let edits = $state(0);
</script>

<ThemeProvider>
	<div style="display: flex; flex-direction: column; gap: 12px; padding: 16px; width: 320px">
		<TextArea label="Notes" placeholder="Write something" hint="Enter adds a line" value={notes} onchange={(v) => (notes = v)} testid="notes" />
		<div testId="echo">chars:{notes.length}</div>
		<TextArea label="Bio" value="first&#10;second" rows={2} error="Too long" testid="bio" />
		<TextArea value="read only" disabled testid="off" onchange={() => edits++} />
		<div testId="edits">edits:{edits}</div>
	</div>
</ThemeProvider>
