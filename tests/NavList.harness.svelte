<script lang="ts">
	import ThemeProvider from '../src/theme/ThemeProvider.svelte';
	import NavList from '../src/components/NavList.svelte';
	let value = $state('inbox');

	const sections = [
		{
			title: 'Mail',
			items: [
				{ id: 'inbox', label: 'Inbox', badge: '12', icon: inboxIcon },
				{ id: 'drafts', label: 'Drafts' },
				{ id: 'starred', label: 'Starred' }
			]
		},
		{
			title: 'Account',
			items: [
				{ id: 'general', label: 'General' },
				{ id: 'billing', label: 'Billing', disabled: true }
			]
		}
	];
</script>

{#snippet inboxIcon()}<text>✉</text>{/snippet}

<ThemeProvider>
	<div style="display: flex; flex-direction: row; gap: 24px; padding: 16px">
		<div style="width: 200px">
			<NavList {sections} {value} testid="nav" onchange={(id) => (value = id)} />
		</div>
		<div testId="state">{`selected:${value}`}</div>
	</div>
</ThemeProvider>
