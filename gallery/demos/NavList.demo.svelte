<script lang="ts">
	import NavList from '../../src/components/NavList.svelte';
	let value = $state('inbox');
	const sections = [
		{
			title: 'Mail',
			items: [
				{ id: 'inbox', label: 'Inbox', badge: '12', icon: inbox },
				{ id: 'drafts', label: 'Drafts', badge: '2' },
				{ id: 'starred', label: 'Starred' }
			]
		},
		{
			title: 'Account',
			items: [
				{ id: 'general', label: 'General', icon: gear },
				{ id: 'billing', label: 'Billing', disabled: true }
			]
		}
	];
</script>

{#snippet inbox()}<text>✉</text>{/snippet}
{#snippet gear()}<text>⚙</text>{/snippet}

<div style="display: flex; flex-direction: row; gap: 32px">
	<div style="width: 220px"><NavList {sections} {value} onchange={(id) => (value = id)} /></div>
	<div style="width: 180px"><NavList {sections} value="general" size="sm" /></div>
</div>
