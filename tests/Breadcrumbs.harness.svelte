<script lang="ts">
	import ThemeProvider from '../src/theme/ThemeProvider.svelte';
	import Breadcrumbs from '../src/components/Breadcrumbs.svelte';
	let visits = $state(0);
	let where = $state('Home');
	const go = (name: string) => () => {
		visits++;
		where = name;
	};
</script>

<ThemeProvider>
	<div style="display: flex; flex-direction: column; gap: 16px; padding: 16px">
		<Breadcrumbs
			testid="crumbs"
			items={[
				{ label: 'Home', onclick: go('Home') },
				{ label: 'Projects', onclick: go('Projects') },
				{ label: 'Fractal' }
			]}
		/>
		<Breadcrumbs size="sm" separator="›" items={[{ label: 'Settings', onclick: go('Settings') }, { label: 'Billing' }]} />
		<div testId="state">{`visits:${visits} at:${where}`}</div>
	</div>
</ThemeProvider>
