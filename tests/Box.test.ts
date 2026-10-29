import { mount_headless, click_test_id, find_test_id, bounds, check, screenshot, finish } from 'gpuix-fractalsvelte/test';
import Harness from './Box.harness.svelte';

mount_headless(Harness, { width: 400, height: 240 });

const box = (id: string) => {
	const b = bounds(find_test_id(id)!)!;
	return { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height) };
};

const frame = box('frame');
check('padding md insets children by 8px', box('inner').x - frame.x === 8);
check('an inline style overrides the padding prop', box('flat').x === frame.x);
click_test_id('toggle');
check('border adds 1px inside the edge', box('inner').x - frame.x === 9);
screenshot('/tmp/gpuix-ui-box.png');
finish('Box', 3);
