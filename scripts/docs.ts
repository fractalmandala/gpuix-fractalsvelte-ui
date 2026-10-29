// Regenerates the Props and Tokens sections of docs/components/*.md from the component source.
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import ts from 'typescript';

const oneLine = (s: string) => s.replace(/\s+/g, ' ').trim();
const cell = (s: string) => s.replace(/\|/g, '\\|');

function instanceScript(src: string): string {
	const scripts = [...src.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
	return scripts.find((s) => s.includes('$props(')) ?? '';
}

function props(src: string): { name: string; type: string; def: string; note: string }[] {
	const code = instanceScript(src);
	const file = ts.createSourceFile('c.ts', code, ts.ScriptTarget.Latest, true);
	const out: { name: string; type: string; def: string; note: string }[] = [];
	const defaults = new Map<string, string>();
	const types = new Map<string, { type: string; note: string }>();

	const visit = (node: ts.Node) => {
		if (ts.isVariableDeclaration(node) && ts.isObjectBindingPattern(node.name) && node.initializer && ts.isCallExpression(node.initializer) && node.initializer.expression.getText() === '$props') {
			const typed = node.type;
			for (const el of node.name.elements) {
				const key = (el.propertyName ?? el.name).getText();
				defaults.set(key, el.initializer ? oneLine(el.initializer.getText()) : '');
			}
			if (typed && ts.isTypeLiteralNode(typed)) {
				for (const m of typed.members) {
					if (!ts.isPropertySignature(m)) continue;
					const name = m.name.getText();
					const jsdoc = (m as any).jsDoc as ts.JSDoc[] | undefined;
					const note = jsdoc?.map((d) => (typeof d.comment === 'string' ? d.comment : '')).join(' ') ?? '';
					types.set(name, { type: m.type ? oneLine(m.type.getText()) : 'any', note: oneLine(note) });
				}
			}
		}
		ts.forEachChild(node, visit);
	};
	visit(file);

	for (const [name, t] of types) out.push({ name, type: t.type, def: defaults.get(name) ?? '', note: t.note });
	return out;
}

function tokens(src: string): string[] {
	const styles = [...src.matchAll(/<style>([\s\S]*?)<\/style>/g)].map((m) => m[1]).join('\n');
	const found = new Set<string>();
	for (const m of styles.matchAll(/var\(--([a-z0-9-]+)/g)) found.add(m[1]);
	return [...found].sort();
}

function section(doc: string, heading: string, body: string): string {
	const start = doc.indexOf(`## ${heading}\n`);
	if (start < 0) return doc;
	const after = doc.indexOf('\n## ', start + 3);
	const end = after < 0 ? doc.length : after + 1;
	return doc.slice(0, start) + `## ${heading}\n\n${body}\n` + (end < doc.length ? doc.slice(end) : '');
}

// Inserts or replaces "## Examples" with the gallery demo's full source, as a consumer would import it.
function examples(doc: string, name: string): string {
	const demo = `gallery/demos/${name}.demo.svelte`;
	if (!existsSync(demo)) return doc;
	const code = readFileSync(demo, 'utf8')
		.replace(/'\.\.\/\.\.\/src\/components\/([\w.]+)'/g, "'gpuix-fractalsvelte-ui/$1'")
		.trimEnd();
	const body = `Every variant, size and state, exactly as the gallery's Demo view renders them.\n\n\`\`\`svelte\n${code}\n\`\`\``;
	let out = doc;
	const start = out.indexOf('## Examples\n');
	if (start >= 0) {
		const after = out.indexOf('\n## ', start + 3);
		out = out.slice(0, start) + out.slice(after < 0 ? out.length : after + 1);
	}
	const gpui = out.indexOf('\n## GPUI notes');
	const block = `## Examples\n\n${body}\n`;
	if (gpui >= 0) return out.slice(0, gpui + 1) + block + '\n' + out.slice(gpui + 1);
	return out.trimEnd() + '\n\n' + block;
}

const names = readdirSync('src/components').filter((f) => f.endsWith('.svelte')).sort();
let updated = 0;
for (const file of names) {
	const name = file.slice(0, -7);
	const doc = `docs/components/${name.toLowerCase()}.md`;
	if (!existsSync(doc)) continue;
	const src = readFileSync(`src/components/${file}`, 'utf8');
	const list = props(src);
	const propsBody = list.length
		? ['| Prop | Type | Default | Notes |', '| --- | --- | --- | --- |', ...list.map((p) => `| \`${p.name}\` | \`${cell(p.type)}\` | ${p.def && p.def !== 'undefined' && p.def !== 'null' ? `\`${cell(p.def)}\`` : '—'} | ${cell(p.note) || ' '} |`)].join('\n')
		: 'This component takes no props.';
	const tk = tokens(src);
	const tokBody = tk.length ? tk.map((t) => `\`${t}\``).join(', ') : 'None; the component takes its colours from the element it sits in.';
	let out = readFileSync(doc, 'utf8');
	out = section(out, 'Props', propsBody);
	out = section(out, 'Tokens', tokBody);
	out = examples(out, name);
	if (out !== readFileSync(doc, 'utf8')) {
		writeFileSync(doc, out);
		updated++;
	}
}
console.log(`docs updated: ${updated}`);
