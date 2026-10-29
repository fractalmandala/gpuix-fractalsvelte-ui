// Regenerates src/index.ts and gallery/registry.ts from the component, doc and demo files.
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';

const names = readdirSync('src/components').filter((f) => f.endsWith('.svelte')).map((f) => f.slice(0, -7)).sort();

writeFileSync(
	'src/index.ts',
	[
		"export * from './theme/index.ts';",
		"export type * from './types.ts';",
		"export { default as ThemeProvider } from './theme/ThemeProvider.svelte';",
		...names.map((n) => `export { default as ${n} } from './components/${n}.svelte';`),
		''
	].join('\n')
);

const order = ['actions', 'inputs', 'layout', 'navigation', 'overlays', 'feedback'];
const entries = names
	.filter((n) => existsSync(`gallery/demos/${n}.demo.svelte`))
	.map((n) => {
		const doc = `docs/components/${n.toLowerCase()}.md`;
		const fm = existsSync(doc) ? readFileSync(doc, 'utf8') : '';
		const category = /category:\s*(\w+)/.exec(fm)?.[1] ?? 'other';
		const description = /description:\s*(.+)/.exec(fm)?.[1]?.trim() ?? '';
		return { n, category, description };
	})
	.sort((a, b) => order.indexOf(a.category) - order.indexOf(b.category) || a.n.localeCompare(b.n));

writeFileSync(
	'gallery/registry.ts',
	[
		...entries.map((e) => `import ${e.n} from './demos/${e.n}.demo.svelte';`),
		'',
		'export const demos = [',
		...entries.map((e) => `\t{ name: '${e.n}', category: '${e.category}', description: ${JSON.stringify(e.description)}, demo: ${e.n} },`),
		'];',
		''
	].join('\n')
);
console.log(`${names.length} components, ${entries.length} demos`);
