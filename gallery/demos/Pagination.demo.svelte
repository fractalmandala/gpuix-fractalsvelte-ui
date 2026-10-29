<script lang="ts">
	import Pagination from '../../src/components/Pagination.svelte';
	let page = $state(1);
	let wide = $state(7);
	let small = $state(2);
</script>

<div style="display: flex; flex-direction: column; gap: 16px; align-items: start">
	<Pagination {page} total={24} onchange={(p) => (page = p)} />
	<Pagination page={wide} total={24} siblings={2} onchange={(p) => (wide = p)} />
	<Pagination page={small} total={5} size="h-sm" onchange={(p) => (small = p)} />
	<Pagination page={3} total={3} size="h-lg" />
	<div style="color: var(--text-secondary)">page {page}</div>
</div>
