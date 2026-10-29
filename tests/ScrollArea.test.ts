import { mount_headless, find_test_id, bounds, center, wheel, wait, check, screenshot, finish } from 'gpuix-fractalsvelte/test';
import Harness from './ScrollArea.harness.svelte';

mount_headless(Harness, { width: 340, height: 300 });

const box = (id: string) => {
	const b = bounds(find_test_id(id)!)!;
	return { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height) };
};

check('maxHeight caps the area', box('long').h === 120);
check('a short list shrinks the area to its content', box('short').h === 48);
check('height fixes the area', box('fixed').h === 80);

const before = box('long-list-thumb').y;
wheel(center(find_test_id('long')!), 0, -200);
await wait(300);
check('wheeling down moves the thumb down', box('long-list-thumb').y > before);
screenshot('/tmp/gpuix-ui-scrollarea.png');
finish('ScrollArea', 4);
