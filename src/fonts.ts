import { register_font } from 'gpuix-fractalsvelte';

/** The family names these files declare — GPUI matches one name exactly, never a CSS stack. */
const files = [
	'GoogleSans.ttf',
	'GoogleSans-Italic.ttf',
	'AtkinsonHyperlegibleMono-VariableFont_wght.ttf'
];

/**
 * Register the bundled faces with the native renderer. Call it at the top of the root component's
 * script, so it runs before the first layout: text laid out against a fallback keeps the fallback.
 *
 * Reads through `process.getBuiltinModule` rather than importing `node:fs`, so the browser bundle
 * still builds; registration is a no-op on the wasm renderer either way.
 */
export function load_fonts(names: Array<string> = files): Array<string> {
	const fs = globalThis.process?.getBuiltinModule?.('node:fs') as typeof import('node:fs') | undefined;
	if (!fs) return [];

	const loaded: Array<string> = [];
	for (const name of names) {
		try {
			register_font(new Uint8Array(fs.readFileSync(new URL(`../static/fonts/${name}`, import.meta.url))));
			loaded.push(name);
		} catch (error) {
			console.warn(`[gpuix-fractalsvelte-ui] ${name}: ${(error as Error).message}`);
		}
	}
	return loaded;
}
