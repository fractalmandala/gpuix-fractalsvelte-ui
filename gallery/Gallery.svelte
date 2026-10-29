<script lang="ts">
	import Scroller from 'gpuix-fractalsvelte/components/Scroller.svelte';
	import ThemeProvider from '../src/theme/ThemeProvider.svelte';
	import { themes, type Theme } from '../src/theme/tokens.ts';
	import { demos } from './registry.ts';
	import ThemeSheet from './ThemeSheet.svelte';

	let theme: Theme = $state(themes.light);
	let current = $state(demos[0]?.name ?? '');
	const active = $derived(demos.find((d) => d.name === current));
	const sheet = $derived(current.startsWith('theme:') ? themes[current.slice(6) as keyof typeof themes] : null);
	const categories = $derived([...new Set(demos.map((d) => d.category))]);
</script>

<ThemeProvider {theme}>
	<div class="shell">
		<div class="side">
			<div class="brand">gpuix-fractalsvelte-ui</div>
			<Scroller gap={2} pad="0 8px 12px 8px">
				{#each categories as category (category)}
					<div class="cat">{category}</div>
					{#each demos.filter((d) => d.category === category) as d (d.name)}
						<div class="item" class:sel={d.name === current} onclick={() => (current = d.name)} testId="nav-{d.name}">{d.name}</div>
					{/each}
				{/each}
				<div class="cat">themes</div>
				{#each Object.values(themes) as t (t.name)}
					<div class="item" class:sel={current === `theme:${t.name}`} onclick={() => (current = `theme:${t.name}`)} testId="nav-theme-{t.name}">{t.name}</div>
				{/each}
			</Scroller>
			<div class="themes">
				{#each Object.values(themes) as t (t.name)}
					<div class="chip" class:sel={t.name === theme.name} onclick={() => (theme = t)} testId="theme-{t.name}">{t.name}</div>
				{/each}
			</div>
		</div>
		<div class="main">
			{#if sheet}
				<div class="title">{sheet.name}</div>
				<div class="desc">Every token in the theme, with its value.</div>
				<div class="stage">
					<ThemeSheet theme={sheet} active={sheet.name === theme.name} onapply={() => (theme = sheet)} />
				</div>
			{:else if active}
				<div class="title">{active.name}</div>
				<div class="desc">{active.description}</div>
				<div class="stage">
					{#key active.name}<active.demo />{/key}
				</div>
			{/if}
		</div>
	</div>
</ThemeProvider>

<style>
	.shell { display: flex; flex-direction: row; width: 100%; height: 100%; }
	.side { display: flex; flex-direction: column; width: 220px; background-color: var(--ui-surface); border-right-width: 1px; border-color: var(--ui-border); }
	.brand { padding: 16px; font-weight: 700; font-size: var(--ui-text-md); }
	.cat { padding: 12px 8px 4px 8px; font-size: var(--ui-text-xs); color: var(--ui-ink-faint); font-weight: 600; }
	.item { padding: 6px 8px; border-radius: var(--ui-radius-sm); color: var(--ui-ink-muted); cursor: pointer; }
	.item:hover { background-color: var(--ui-raised); }
	.item.sel { background-color: var(--ui-accent-soft); color: var(--ui-accent); }
	.themes { display: flex; flex-direction: row; flex-wrap: wrap; gap: 4px; padding: 12px; border-top-width: 1px; border-color: var(--ui-border); }
	.chip { padding: 3px 8px; border-radius: var(--ui-radius-full); font-size: var(--ui-text-xs); color: var(--ui-ink-muted); background-color: var(--ui-raised); cursor: pointer; }
	.chip.sel { background-color: var(--ui-accent); color: var(--ui-accent-ink); }
	.main { display: flex; flex-direction: column; flex-grow: 1; padding: 32px 40px; gap: 6px; overflow: scroll; }
	.title { font-size: var(--ui-text-2xl); font-weight: 700; }
	.desc { color: var(--ui-ink-muted); padding-bottom: 20px; }
	.stage { display: flex; flex-direction: column; padding: 24px; background-color: var(--ui-surface); border-width: 1px; border-color: var(--ui-border); border-radius: var(--ui-radius-lg); }
</style>
