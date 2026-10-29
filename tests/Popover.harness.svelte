<script lang="ts">
	import ThemeProvider from '../src/theme/ThemeProvider.svelte';
	import Button from '../src/components/Button.svelte';
	import Popover from '../src/components/Popover.svelte';
	let open = $state(false);
	let picked = $state(0);
	let outside = $state(0);
</script>

<ThemeProvider>
	<div style="display: flex; flex-direction: row; gap: 24px; padding: 16px">
		<Popover {open} onclose={() => (open = false)} testid="pop">
			<Button label="Menu" variant="outline" tone="neutral" testid="trigger" onclick={() => (open = !open)} />
			{#snippet content()}
				<div class="item" onclick={() => { picked++; open = false; }} testId="rename">Rename</div>
				<div class="item" onclick={() => { picked += 10; open = false; }}>Duplicate</div>
			{/snippet}
		</Popover>
		<div testId="outside" onclick={() => outside++}>outside</div>
	</div>
	<div testId="counts">picked:{picked} outside:{outside}</div>
</ThemeProvider>

<style>
	.item { padding: 6px 10px; border-radius: var(--ui-radius-sm); color: var(--ui-ink); }
	.item:hover { background-color: var(--ui-raised); }
</style>
