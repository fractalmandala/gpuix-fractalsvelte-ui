<script lang="ts">
	import ThemeProvider from '../src/theme/ThemeProvider.svelte';
	import Button from '../src/components/Button.svelte';
	import TextInput from '../src/components/TextInput.svelte';
	let name = $state('');
	let submitted = $state('');
	let email = $state('bad');
	let locked_edits = $state(0);
</script>

<ThemeProvider>
	<div style="display: flex; flex-direction: column; gap: 12px; padding: 16px; width: 320px">
		<TextInput label="Name" placeholder="Your name" hint="Shown under the field" value={name} onchange={(v) => (name = v)} onsubmit={(v) => (submitted = v)} testid="name" />
		<div testId="echo">name:{name}</div>
		<div testId="submitted">submitted:{submitted}</div>
		<TextInput label="Email" value={email} error="Enter a valid email" onchange={(v) => (email = v)} testid="email" />
		<div testId="email-echo">email:{email}</div>
		<TextInput value="locked" disabled testid="locked" onchange={() => locked_edits++} />
		<div style="display: flex; flex-direction: row; gap: 8px">
			<TextInput value="" size="sm" placeholder="sm" style="flex-grow: 1" testid="sm" />
			<TextInput value="" size="lg" placeholder="lg" style="flex-grow: 1" testid="lg" />
		</div>
		<div testId="locked-edits">edits:{locked_edits}</div>
		<Button label="Clear" size="sm" variant="ghost" testid="clear" onclick={() => (name = '')} />
	</div>
</ThemeProvider>
