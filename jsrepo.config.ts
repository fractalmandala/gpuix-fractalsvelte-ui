import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { defineConfig } from 'jsrepo';
import { fs } from 'jsrepo/providers';
import { repository } from 'jsrepo/outputs';

const meta = (doc: string) => {
	const fm = existsSync(doc) ? readFileSync(doc, 'utf8') : '';
	return {
		description: /description:\s*(.+)/.exec(fm)?.[1]?.trim(),
		category: /category:\s*(\w+)/.exec(fm)?.[1]
	};
};

const components = readdirSync('src/components')
	.filter((f) => f.endsWith('.svelte'))
	.map((f) => f.slice(0, -7))
	.map((name) => {
		const doc = `docs/components/${name.toLowerCase()}.md`;
		const { description, category } = meta(doc);
		const files: { path: string; role?: string }[] = [{ path: `src/components/${name}.svelte` }];
		if (name === 'Toast') files.push({ path: 'src/components/toast.svelte.ts' });
		if (existsSync(doc)) files.push({ path: doc, role: 'doc', dependencyResolution: 'manual' });
		if (existsSync(`gallery/demos/${name}.demo.svelte`)) files.push({ path: `gallery/demos/${name}.demo.svelte`, role: 'example' });
		return {
			name: name.toLowerCase(),
			title: name,
			type: 'component',
			description,
			categories: category ? [category] : undefined,
			files,
			registryDependencies: ['theme']
		};
	});

export default defineConfig({
	registry: {
		name: 'gpuix-fractalsvelte-ui',
		description: 'Themed Svelte 5 components that render natively in GPUI through gpuix-fractalsvelte.',
		excludeDeps: ['svelte', 'gpuix-fractalsvelte'],
		outputs: [repository()],
		items: [
			{
				name: 'theme',
				title: 'Theme',
				type: 'theme',
				description: 'ThemeProvider, the --ui-* token contract and the built-in themes.',
				add: 'on-init',
				files: [
					{ path: 'src/theme/tokens.ts' },
					{ path: 'src/theme/index.ts' },
					{ path: 'src/theme/ThemeProvider.svelte' },
					{ path: 'docs/theming.md', role: 'doc', dependencyResolution: 'manual' }
				]
			},
			{ name: 'types', type: 'lib', add: 'when-needed', files: [{ path: 'src/types.ts' }] },
			{ name: 'group', type: 'lib', add: 'when-needed', files: [{ path: 'src/group.svelte.ts' }] },
			...components
		]
	},
	providers: [fs()]
});
