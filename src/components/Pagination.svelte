<script lang="ts">
	import Button from './Button.svelte';
	import type { Size } from '../types.ts';

	let {
		page,
		total,
		siblings = 1,
		onchange = undefined,
		size = 'md',
		style = null,
		testid = null
	}: {
		/** The current page, from 1. */
		page: number;
		total: number;
		/** Pages shown either side of the current one. */
		siblings?: number;
		onchange?: (page: number) => void;
		size?: Size;
		style?: string | null;
		testid?: string | null;
	} = $props();

	const box = $derived({ sm: 26, md: 32, lg: 40 }[size]);

	type Slot = number | 'gap';
	const slots = $derived.by(() => {
		const out: Slot[] = [1];
		const from = Math.max(2, page - siblings);
		const to = Math.min(total - 1, page + siblings);
		if (from > 2) out.push('gap');
		for (let p = from; p <= to; p++) out.push(p);
		if (to < total - 1) out.push('gap');
		if (total > 1) out.push(total);
		return out;
	});

	function go(p: number) {
		if (p >= 1 && p <= total && p !== page) onchange?.(p);
	}
</script>

<div class="pager" {style} testId={testid}>
	<Button variant="ghost" tone="neutral" {size} label="Previous" disabled={page <= 1} onclick={() => go(page - 1)} testid={testid && `${testid}-prev`} />
	{#each slots as slot, i (i)}
		{#if slot === 'gap'}
			<div class="gap" style="height: {box}px">…</div>
		{:else}
			{@const current = slot === page}
			<Button
				variant={current ? 'solid' : 'ghost'}
				tone={current ? 'accent' : 'neutral'}
				{size}
				label={String(slot)}
				style="min-width: {box}px; padding: 0 6px"
				onclick={() => go(slot)}
				testid={testid && `${testid}-${slot}`}
			/>
		{/if}
	{/each}
	<Button variant="ghost" tone="neutral" {size} label="Next" disabled={page >= total} onclick={() => go(page + 1)} testid={testid && `${testid}-next`} />
</div>

<style>
	.pager { display: flex; flex-direction: row; align-items: center; gap: 4px; }
	.gap { display: flex; flex-direction: row; align-items: center; justify-content: center; width: 24px; color: var(--ui-ink-faint); }
</style>
