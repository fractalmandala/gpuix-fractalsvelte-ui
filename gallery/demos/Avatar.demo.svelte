<script lang="ts">
	import Avatar from '../../src/components/Avatar.svelte';
	const PEOPLE = ['Ada Lovelace', 'Grace Hopper', 'Alan Turing'];
</script>

<div style="display: flex; flex-direction: column; gap: 16px">
	<div style="display: flex; flex-direction: row; gap: 12px; align-items: center">
		<Avatar name="Ada Lovelace" size="sm" />
		<Avatar name="Ada Lovelace" />
		<Avatar name="Ada Lovelace" size="lg" />
		<Avatar name="Ada Lovelace" size="lg" shape="square" />
		<Avatar name="Grace Hopper" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAIAAABLbSncAAAAgElEQVR4nA3JIQFFMQhA0R/n1VgNGqAxa4CZXgMaoDGEwNwwf8ee3ycsQQQTjhBCCSP8PmUpophylFBKGX2xWRvZ2OZsYlOb2S+c5YhjznHCKWf8xWVd5GKXc4lLXea+CFYggQUniKCCiRfJSiSx5CSRVDL5olmNNNacJppqpvkDd6t6gRN3ZoUAAAAASUVORK5CYII=" size="lg" />
	</div>
	<div style="display: flex; flex-direction: row; gap: 8px; align-items: center">
		{#each PEOPLE as person}
			<Avatar name={person} />
		{/each}
	</div>
</div>
