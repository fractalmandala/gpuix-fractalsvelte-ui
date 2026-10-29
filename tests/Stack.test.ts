import 'gpuix-fractalsvelte';
import { mount_headless, click_test_id, find_test_id, bounds, check, screenshot, finish } from 'gpuix-fractalsvelte/test';
import Harness from './Stack.harness.svelte';

mount_headless(Harness, { width: 500, height: 300 });

const box = (id: string) => {
	const b = bounds(find_test_id(id)!)!;
	return { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height) };
};

let a = box('a');
let b = box('b');
check('row: items sit side by side with a 12px gap', b.x - a.x - a.w === 12 && a.y === b.y);

click_test_id('flip');
a = box('a');
b = box('b');
const s = box('stack');
const frame = box('frame');
const row = box('row');
check('column: items stack with a 12px gap', b.y - a.y - a.h === 12 && a.x === b.x);
// bounds() reports a padded or bordered element's content origin, so padding is measured from unbordered neighbours.
check('padding md insets the first item by 12px', a.x - frame.x === 12 && a.y - (row.y + row.h + 12) === 12);

click_test_id('flip');
click_test_id('center');
const c = box('c');
a = box('a');
const left = a.x - frame.x;
check('justify center moves items off the start edge', left > 8);
check('justify center is symmetric', left === frame.x + frame.w - (c.x + c.w));

const wa = box('wa');
check('wrap off: items stay on one line', box('wc').y === wa.y);
screenshot('/tmp/gpuix-ui-stack.png');
click_test_id('wrap');
check('wrap on: the third item moves to a new line', box('wc').y > wa.y);
finish('Stack', 7);
