<script lang="ts">
	import Button from '../src/components/Button.svelte';
	import type { Theme, Tokens } from '../src/theme/tokens.ts';

	let { theme, active = false, onapply }: { theme: Theme; active?: boolean; onapply: () => void } = $props();

	type Key = keyof Tokens;
	const groups: { title: string; keys: Key[] }[] = [
		{ title: 'Surfaces', keys: ['bg', 'surface', 'raised', 'overlay', 'scrim'] },
		{ title: 'Text', keys: ['ink', 'ink-muted', 'ink-faint'] },
		{ title: 'Lines', keys: ['border', 'border-strong', 'ring'] },
		{ title: 'Accent', keys: ['accent', 'accent-hover', 'accent-ink', 'accent-soft'] },
		{ title: 'Success', keys: ['success', 'success-ink', 'success-soft'] },
		{ title: 'Warn', keys: ['warn', 'warn-ink', 'warn-soft'] },
		{ title: 'Danger', keys: ['danger', 'danger-hover', 'danger-ink', 'danger-soft'] }
	];
	const radii: Key[] = ['radius-0', 'radius-sm', 'radius-md', 'radius-bs', 'radius-lg', 'radius-full'];
	const sizes: Key[] = ['text-xs', 'text-sm', 'text-md', 'text-lg', 'text-xl', 'text-2xl'];
	const t = $derived(theme.tokens);
</script>

<div style="display: flex; flex-direction: column; gap: 20px">
	<div style="display: flex; flex-direction: row; align-items: center; gap: 12px">
		<div style="color: var(--ui-ink-muted)">{theme.dark ? 'Dark' : 'Light'} theme · {Object.keys(t).length} tokens</div>
		<div style="flex-grow: 1"></div>
		<Button label={active ? 'Applied' : 'Apply theme'} variant={active ? 'soft' : 'solid'} disabled={active} onclick={onapply} testid="apply-{theme.name}" />
	</div>

	<div class="preview" style="background-color: {t.bg}; border-color: {t.border}; border-radius: {t['radius-lg']}">
		<div class="card" style="background-color: {t.surface}; border-color: {t.border}; border-radius: {t['radius-md']}">
			<div style="color: {t.ink}; font-size: {t['text-lg']}; font-weight: 600">{theme.name}</div>
			<div style="display: flex; flex-direction: row; gap: 12px">
				<div style="color: {t.ink}">Ink</div>
				<div style="color: {t['ink-muted']}">Muted ink</div>
				<div style="color: {t['ink-faint']}">Faint ink</div>
			</div>
			<div style="display: flex; flex-direction: row; gap: 6px">
				{#each ['accent', 'success', 'warn', 'danger'] as tone}
					<div class="pill" style="background-color: {t[tone as Key]}; color: {t[`${tone}-ink` as Key]}">{tone}</div>
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
					<div class="chip" style="background-color: {t['accent-soft']}; border-color: {t.accent}; border-width: 1px; border-radius: {t[k]}"></div>
					<div class="name">{k}</div>
					<div class="value">{t[k]}</div>
				</div>
			{/each}
		</div>
	</div>

	<div class="group">
		<div class="label">Type · {t.font} / {t['font-mono']}</div>
		<div style="display: flex; flex-direction: column; gap: 6px">
			{#each sizes as k (k)}
				<div style="display: flex; flex-direction: row; align-items: center; gap: 12px">
					<div class="value" style="width: 110px">{k} · {t[k]}</div>
					<div style="font-size: {t[k]}; font-family: {t.font}">The quick brown fox</div>
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
	.label { font-size: var(--ui-text-xs); font-weight: 600; color: var(--ui-ink-faint); }
	.row { display: flex; flex-direction: row; flex-wrap: wrap; gap: 12px; }
	.swatch { display: flex; flex-direction: column; gap: 4px; width: 112px; }
	.chip { height: 48px; border-radius: var(--ui-radius-md); border-width: 1px; border-color: var(--ui-border); }
	.name { font-size: var(--ui-text-sm); font-weight: 500; color: var(--ui-ink); }
	.value { font-size: var(--ui-text-xs); font-family: var(--ui-font-mono); color: var(--ui-ink-muted); }
</style>
