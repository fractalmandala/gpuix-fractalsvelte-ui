import { mount_headless, click_test_id, find_test_id, bounds, wheel, find_text, screenshot, check, finish } from 'gpuix-fractalsvelte/test';
import { demos } from '../gallery/registry.ts';
import Gallery from '../gallery/Gallery.svelte';

const H = 530;
mount_headless(Gallery, { width: 1000, height: H });

function open(name: string) {
	const id = `nav-${name}`;
	for (let i = 0; i < 20; i++) {
		const b = bounds(find_test_id(id)!)!;
		if (b.y >= 0 && b.y + b.height <= H - 80) break;
		wheel({ x: 100, y: 200 }, 0, b.y > H / 2 ? -120 : 120);
	}
	click_test_id(id);
}

let ok = 0;
const broken: string[] = [];
for (const d of demos) {
	open(d.name);
	if (find_text(d.description)) ok++;
	else broken.push(d.name);
	screenshot(`/tmp/gpuix-ui-gallery-${d.name}.png`);
}
if (broken.length) console.log('broken: ' + broken.join(', '));
check('every demo renders', ok, demos.length);
for (const name of ['light', 'dark', 'mandala', 'midnight']) {
	open(`theme-${name}`);
	if (find_text('Every token in the theme, with its value.') && find_test_id(`swatch-${name}-accent`)) ok++;
	screenshot(`/tmp/gpuix-ui-gallery-theme-${name}.png`);
}
check('every theme sheet renders', ok, demos.length + 4);
click_test_id('apply-midnight');
check('apply switches the active theme', !!find_text('Applied'));
click_test_id('theme-dark');
screenshot('/tmp/gpuix-ui-gallery-dark.png');
check('theme switch survives', !!find_test_id('swatch-midnight-accent'));
finish('Gallery', 4);
