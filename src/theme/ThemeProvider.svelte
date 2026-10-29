<script lang="ts">
	import { set_css_vars, set_fractalstyler_mode } from 'gpuix-fractalsvelte';
	import type { Snippet } from 'svelte';
	import { light, to_vars, type Theme, type Tokens } from './tokens.ts';

	let {
		children,
		theme = light,
		tokens = {},
		style = null,
		testid = null
	}: {
		children: Snippet;
		/** One of `themes`, or your own from `create_theme`. */
		theme?: Theme;
		/** Per-token overrides applied over `theme`. */
		tokens?: Partial<Tokens>;
		style?: string | null;
		testid?: string | null;
	} = $props();

	$effect(() => {
		const t = { ...theme.tokens, ...tokens };
		set_fractalstyler_mode(theme.dark ? 'dark' : 'light');
		// The base package's Scroller reads its own vars; feed them from the theme.
		set_css_vars({ ...to_vars(t), 'scroller-thumb': t['text-muted'], 'scroller-thumb-hover': t['text-secondary'] });
	});
</script>

<div class="ui-root" {style} testId={testid}>{@render children()}</div>

<style>
	.ui-root {
		display: flex;
		flex-direction: column;
		width: 100%;
		height: 100%;
		background-color: var(--bg, #f6f6f7);
		color: var(--text-primary, #1b1d24);
		font-family: var(--font-sans, Inter);
		font-size: var(--text-md, 14px);
	}
</style>
