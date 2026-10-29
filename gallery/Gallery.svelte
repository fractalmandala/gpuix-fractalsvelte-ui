<script lang="ts">
	import { load_fonts } from '../src/fonts.ts';
	import Scroller from 'gpuix-fractalsvelte/components/Scroller.svelte';
	import ThemeProvider from '../src/theme/ThemeProvider.svelte';
	import { themes, type Theme } from '../src/theme/tokens.ts';
	import { demos } from './registry.ts';
	import ThemeSheet from './ThemeSheet.svelte';

	// Before the first layout, so every glyph below paints in the bundled faces.
	load_fonts();

	let theme: Theme = $state(themes.light);
	let current = $state(demos[0]?.name ?? '');
	const active = $derived(demos.find((d) => d.name === current));
	let view = $state<'demo' | 'docs'>('demo');
	const t = $derived(theme.tokens);
	// The markdown element takes literal colours, so it gets the theme's values.
	const docTheme = $derived({
		appearance: theme.dark ? 'dark' : 'light',
		bg: t['bg'],
		border: t.border,
		text: t['text-primary'],
		textMuted: t['text-secondary'],
		textFaint: t['text-muted'],
		accent: t['theme-color'],
		codeText: t['text-primary'],
		codeWash: t['bg-raised'],
		fontSans: t['font-sans'],
		fontMono: t['font-mono']
	} as const);
	const sheet = $derived(
		current.startsWith('theme:') ? themes[current.slice(6) as keyof typeof themes] : null
	);
	const categories = $derived([...new Set(demos.map((d) => d.category))]);
</script>

<ThemeProvider {theme}>
	<div class="app-shell">
		<div class="app-main">
			<div class="sidebar-left">
					<Scroller gap={2} pad="0 8px 12px 8px">
						{#each categories as category (category)}
							<div class="cat">{category}</div>
							{#each demos.filter((d) => d.category === category) as d (d.name)}
								<div
									class="item"
									class:sel={d.name === current}
									onclick={() => (current = d.name)}
									testId="nav-{d.name}"
								>
									{d.name}
								</div>
							{/each}
						{/each}

						<div class="cat">themes</div>
						{#each Object.values(themes) as th (th.name)}
							<div
								class="item"
								class:sel={current === `theme:${th.name}`}
								onclick={() => (current = `theme:${th.name}`)}
								testId="nav-theme-{th.name}"
							>
								{th.name}
							</div>
						{/each}
					</Scroller>
					<div class="themes">
						{#each Object.values(themes) as th (th.name)}
							<div
								class="chip"
								class:sel={th.name === theme.name}
								onclick={() => (theme = th)}
								testId="theme-{th.name}"
							>
								{th.name}
							</div>
						{/each}
					</div>
			</div>
			<div class="main-section">
						{#if sheet}
							<div class="title">{sheet.name}</div>
							<div class="desc">Every token in the theme, with its value.</div>
							<div class="stage">
								<ThemeSheet
									theme={sheet}
									active={sheet.name === theme.name}
									onapply={() => (theme = sheet)}
								/>
							</div>
						{:else if active}
							<div class="title">{active.name}</div>
							<div class="desc">{active.description}</div>
							<div class="views">
								<div
									class="chip"
									class:sel={view === 'demo'}
									onclick={() => (view = 'demo')}
									testId="view-demo"
								>
									Demo
								</div>
								<div
									class="chip"
									class:sel={view === 'docs'}
									onclick={() => (view = 'docs')}
									testId="view-docs"
								>
									Docs
								</div>
							</div>
							{#if view === 'demo'}
								<div class="stage">
									{#key active.name}<active.demo />{/key}
								</div>
							{:else}
								<div class="stage docs" testId="docs-{active.name}">
									<markdown source={active.docs} theme={docTheme}></markdown>
								</div>
							{/if}
						{/if}
			</div>
			<div class="sidebar-right">
				hi
			</div>
		</div>
	</div>
</ThemeProvider>

<style>

	.cat {
		padding: 12px 8px 4px 8px;
		font-size: var(--text-xs);
		color: var(--text-muted);
		font-weight: 600;
	}
	.item {
		padding: 6px 8px;
		border-radius: var(--radius-sm);
		color: var(--text-secondary);
		cursor: pointer;
	}
	.item:hover {
		background-color: var(--bg-raised);
	}
	.item.sel {
		background-color: var(--theme-color-sub);
		color: var(--theme-color);
	}
	.themes {
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
		gap: 4px;
		padding: 12px;
		border-top-width: 1px;
		border-color: var(--border);
	}
	.chip {
		padding: 3px 8px;
		border-radius: var(--radius-full);
		font-size: var(--text-xs);
		color: var(--text-secondary);
		background-color: var(--bg-raised);
		cursor: pointer;
	}
	.chip.sel {
		background-color: var(--theme-color);
		color: var(--text-theme);
	}
	.title {
		font-size: var(--text-2xl);
		font-weight: 700;
	}
	.desc {
		color: var(--text-secondary);
		padding-bottom: 20px;
	}
	.views {
		display: flex;
		flex-direction: row;
		gap: 4px;
		margin-bottom: 14px;
	}
	.stage.docs {
		align-items: stretch;
	}
	.stage {
		display: flex;
		flex-direction: column;
		padding: 24px;
		background-color: var(--bg-surface);
		border-width: 1px;
		border-color: var(--border);
		border-radius: var(--radius-lg);
	}
</style>
