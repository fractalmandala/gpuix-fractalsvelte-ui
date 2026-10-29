<script lang="ts">
	import ThemeProvider from '../src/theme/ThemeProvider.svelte';
	import Button from '../src/components/Button.svelte';
	import Popover from '../src/components/Popover.svelte';
	let open = $state(false);
	let picked = $state(0);
	let outside = $state(0);
	let at = $state(false);
</script>

<ThemeProvider>
	<div style="display: flex; flex-direction: row; gap: 24px; padding: 16px">
		<Popover {open} onclose={() => (open = false)} testid="pop">
			<Button label="Menu" variant="outline" testid="trigger" onclick={() => (open = !open)} />
			{#snippet content()}
				<div class="item" onclick={() => { picked++; open = false; }} testId="rename">Rename</div>
				<div class="item" onclick={() => { picked += 10; open = false; }}>Duplicate</div>
			{/snippet}
		</Popover>
		<div testId="outside" onclick={() => outside++}>outside</div>
		<Button label="At point" variant="outline" testid="point" onclick={() => (at = !at)} />
	</div>
	<Popover open={at} onclose={() => (at = false)} position={{ x: 250, y: 120 }} testid="at">
		<div testId="at-item">Pinned item</div>
		{#snippet content()}<div testId="at-content">Pinned item</div>{/snippet}
	</Popover>
	<div testId="counts">picked:{picked} outside:{outside}</div>
</ThemeProvider>

<style>
	.item { padding: 6px 10px; border-radius: var(--radius-sm); color: var(--text-primary); }
	.item:hover { background-color: var(--bg-raised); }
</style>
