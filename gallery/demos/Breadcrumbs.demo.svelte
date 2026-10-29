<script lang="ts">
	import Breadcrumbs from '../../src/components/Breadcrumbs.svelte';
	let visited = $state('none');
	const go = (name: string) => () => (visited = name);
</script>

<div style="display: flex; flex-direction: column; gap: 16px; align-items: start">
	<Breadcrumbs
		items={[
			{ label: 'Workspace', onclick: go('Workspace') },
			{ label: 'Projects', onclick: go('Projects') },
			{ label: 'Fractal UI' }
		]}
	/>
	<Breadcrumbs
		size="sm"
		separator="›"
		items={[{ label: 'Settings', onclick: go('Settings') }, { label: 'Keyboard' }]}
	/>
	<Breadcrumbs
		size="lg"
		separator="→"
		items={[{ label: 'Docs', onclick: go('Docs') }, { label: 'Components' }]}
	/>
	<div style="color: var(--text-secondary)">last visited: {visited}</div>
</div>
