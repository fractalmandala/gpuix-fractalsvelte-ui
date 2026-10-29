<script lang="ts">
	import Avatar from '../src/components/Avatar.svelte';
	import Button from '../src/components/Button.svelte';
	const NAMES = ['Ada Lovelace', 'Grace Hopper', 'linus'];
	let i = $state(0);
	const name = $derived(NAMES[i]);
</script>

<div style="display: flex; flex-direction: column; gap: 16px; padding: 16px">
	<div style="display: flex; flex-direction: row; gap: 12px; align-items: center">
		<Avatar {name} size="sm" testid="av-sm" />
		<Avatar {name} testid="av-md" />
		<Avatar {name} size="lg" testid="av-lg" />
		<Avatar {name} size="lg" shape="square" testid="av-square" />
		<Avatar name="Grace Hopper" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAIAAABLbSncAAAAgElEQVR4nA3JIQFFMQhA0R/n1VgNGqAxa4CZXgMaoDGEwNwwf8ee3ycsQQQTjhBCCSP8PmUpophylFBKGX2xWRvZ2OZsYlOb2S+c5YhjznHCKWf8xWVd5GKXc4lLXea+CFYggQUniKCCiRfJSiSx5CSRVDL5olmNNNacJppqpvkDd6t6gRN3ZoUAAAAASUVORK5CYII=" testid="photo" />
	</div>
	<div style="display: flex; flex-direction: row; gap: 8px; align-items: center">
		<Button label="Rename" size="h-md" variant="outline" testid="rename" onclick={() => (i = (i + 1) % NAMES.length)} />
		<div testId="name">{name}</div>
	</div>
</div>
