import 'gpuix-fractalsvelte';
import { mount_headless, click_test_id, find_test_id, bounds, check, screenshot, finish } from 'gpuix-fractalsvelte/test';
import Harness from './Spacer.harness.svelte';

mount_headless(Harness, { width: 400, height: 200 });

const box = (id: string) => {
	const b = bounds(find_test_id(id)!)!;
	return { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height) };
};

const row = box('row');
const start = box('start');
const end = box('end');
const spacer = box('spacer');
check('the spacer fills the space between the items', spacer.w === row.w - 60 - 60 - 16);
check('the last item sits at the far edge', end.x + end.w === row.x + row.w);
screenshot('/tmp/gpuix-ui-spacer.png');
click_test_id('toggle');
check('without the spacer the items sit side by side', box('end').x - (box('start').x + box('start').w) === 8);
finish('Spacer', 3);
