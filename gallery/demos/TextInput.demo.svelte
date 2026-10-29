<script lang="ts">
	import TextInput from '../../src/components/TextInput.svelte';
	let name = $state('');
	let site = $state('');
	let submitted = $state('');
	let query = $state('');
</script>

<div style="display: flex; flex-direction: column; gap: 16px; width: 360px">
	<div style="display: flex; flex-direction: row; gap: 8px; align-items: flex-end">
		<TextInput size="sm" placeholder="Small" style="flex-grow: 1; flex-basis: 0; min-width: 0" />
		<TextInput size="md" placeholder="Medium" style="flex-grow: 1; flex-basis: 0; min-width: 0" />
		<TextInput size="lg" placeholder="Large" style="flex-grow: 1; flex-basis: 0; min-width: 0" />
	</div>

	<TextInput
		label="Name"
		placeholder="Ada Lovelace"
		hint="Shown on your profile"
		value={name}
		onchange={(v) => (name = v)}
		onsubmit={(v) => (submitted = v)}
	/>
	<div style="color: var(--ui-ink-muted); font-size: var(--ui-text-sm)">submitted: {submitted || '—'}</div>

	<TextInput label="Website" placeholder="example.com" value={site} onchange={(v) => (site = v)}>
		{#snippet leading()}<div>https://</div>{/snippet}
	</TextInput>

	<TextInput
		placeholder="Search notes"
		value={query}
		onchange={(v) => (query = v)}
	>
		{#snippet trailing()}<div style="font-size: var(--ui-text-xs)">esc</div>{/snippet}
	</TextInput>

	<TextInput label="Email" value="ada@" error="Enter a valid email address" />
	<TextInput label="Organisation" value="Analytical Engine Ltd" disabled hint="Managed by your admin" />
</div>
