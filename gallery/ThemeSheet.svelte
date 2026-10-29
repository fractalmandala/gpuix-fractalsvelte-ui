<script lang="ts">
	import Button from '../src/components/Button.svelte';
	import type { Theme, Tokens } from '../src/theme/tokens.ts';

	let { theme, active = false, onapply }: { theme: Theme; active?: boolean; onapply: () => void } = $props();

	type Key = keyof Tokens;
	const groups: { title: string; keys: Key[] }[] = [
		{ title: 'Surfaces', keys: ['bg', 'bg-surface', 'bg-raised', 'bg-sunken', 'bg-extra'] },
		{ title: 'Text', keys: ['text-primary', 'text-secondary', 'text-muted'] },
		{ title: 'Lines', keys: ['border', 'border-strong', 'ring'] },
		{ title: 'Accent', keys: ['theme-color', 'theme-color-alt', 'text-theme', 'theme-color-sub'] },
		{ title: 'Success', keys: ['success', 'success-hover', 'success-soft'] },
		{ title: 'Warn', keys: ['warning', 'warning-hover', 'warning-soft'] },
		{ title: 'Danger', keys: ['danger', 'danger-hover', 'danger-soft']},
		{ title: 'Info', keys: ['info', 'info-hover', 'info-soft'] }
	];
	const radii: Key[] = ['radius-0', 'radius-sm', 'radius-md', 'radius-bs', 'radius-lg', 'radius-full'];
	const sizes: Key[] = ['text-xs', 'text-sm', 'text-md', 'text-lg', 'text-xl', 'text-2xl'];
	const t = $derived(theme.tokens);
</script>

<div class="box gap-bs">
	<div class="row ycenter gap-bs">
		<div class="text-secondary">{theme.dark ? 'Dark' : 'Light'} theme · {Object.keys(t).length} tokens</div>
		<div style="flex-grow: 1"></div>
		<Button label={active ? 'Applied' : 'Apply theme'} variant={active ? 'secondary' : 'primary'} disabled={active} onclick={onapply} testid="apply-{theme.name}" />
	</div>

	<div class="preview">
		<div class="card" style="background-color: {t['bg-surface']}; border-color: {t.border}; border-radius: {t['radius-md']}">
			<div class="text-primary text-lg weight-600">{theme.name}</div>
			<div style="display: flex; flex-direction: row; gap: 12px">
				<div style="color: {t['text-primary']}">Ink</div>
				<div style="color: {t['text-secondary']}">Muted ink</div>
				<div style="color: {t['text-muted']}">Faint ink</div>
			</div>
			<div style="display: flex; flex-direction: row; gap: 6px">
				{#each ['theme-color', 'success', 'warning', 'danger'] as tone}
					<div class="pill" style="background-color: {t[tone as Key]}; color: {t['text-inverse']}">{tone}</div>
					<div class="pill" style="background-color: {t[`${tone}-soft` as Key]}; color: {t[tone as Key]}">soft</div>
				{/each}
			</div>
		</div>
	</div>

	{#each groups as g (g.title)}
		<div class="group">
			<div class="label">{g.title}</div>
			<div class="row">
				{#each g.keys as k (k)}
					<div class="swatch" testId="swatch-{theme.name}-{k}">
						<div class="chip" style="background-color: {t[k]}"></div>
						<div class="name">{k}</div>
						<div class="value">{t[k]}</div>
					</div>
				{/each}
			</div>
		</div>
	{/each}

	<div class="group">
		<div class="label">Radii</div>
		<div class="row">
			{#each radii as k (k)}
				<div class="swatch">
					<div class="chip" style="background-color: {t['theme-color-sub']}; border-color: {t['theme-color']}; border-width: 1px; border-radius: {t[k]}"></div>
					<div class="name">{k}</div>
					<div class="value">{t[k]}</div>
				</div>
			{/each}
		</div>
	</div>

	<div class="group">
		<div class="label">Type · {t['font-sans']} / {t['font-mono']}</div>
		<div style="display: flex; flex-direction: column; gap: 6px">
			{#each sizes as k (k)}
				<div style="display: flex; flex-direction: row; align-items: center; gap: 12px">
					<div class="value" style="width: 110px">{k} · {t[k]}</div>
					<div style="font-size: {t[k]}; font-family: {t['font-sans']}">The quick brown fox</div>
				</div>
			{/each}
		</div>
	</div>
</div>

<style>
	.preview { display: flex; padding: 20px; border-width: 1px; }
	.card { display: flex; flex-direction: column; gap: 10px; padding: 16px; border-width: 1px; flex-grow: 1; }
	.pill { padding: 2px 8px; border-radius: 999px; font-size: 12px; font-weight: 500; }
	.group { display: flex; flex-direction: column; gap: 8px; }
	.label { font-size: var(--text-xs); font-weight: 600; color: var(--text-muted); }
	.row { display: flex; flex-direction: row; flex-wrap: wrap; gap: 12px; }
	.swatch { display: flex; flex-direction: column; gap: 4px; width: 112px; }
	.chip { height: 48px; border-radius: var(--radius-md); border-width: 1px; border-color: var(--border); }
	.name { font-size: var(--text-sm); font-weight: 500; color: var(--text-primary); }
	.value { font-size: var(--text-xs); font-family: var(--font-mono); color: var(--text-secondary); }
</style>
