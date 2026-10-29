<script lang="ts">
	import ThemeProvider from '../src/theme/ThemeProvider.svelte';
	import Pagination from '../src/components/Pagination.svelte';
	let page = $state(3);
	let small = $state(1);
</script>

<ThemeProvider>
	<div style="display: flex; flex-direction: column; gap: 16px; padding: 16px; align-items: start">
		<Pagination {page} total={10} testid="pg" onchange={(p) => (page = p)} />
		<Pagination page={small} total={3} size="h-sm" testid="sm" onchange={(p) => (small = p)} />
		<div testId="state">{`page:${page} small:${small}`}</div>
	</div>
</ThemeProvider>
