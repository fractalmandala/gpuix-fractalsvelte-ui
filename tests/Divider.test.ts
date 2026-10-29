import { mount_headless, click_test_id, find_test_id, find_text, bounds, check, screenshot, finish } from 'gpuix-fractalsvelte/test';
import Harness from './Divider.harness.svelte';

mount_headless(Harness, { width: 320, height: 240 });

const box = (id: string) => {
	const b = bounds(find_test_id(id)!)!;
	return { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height) };
};

check('a plain horizontal divider is 1px tall and spans the frame', box('split').h === 1 && box('split').w === box('frame').w);
check('a vertical divider is 1px wide and stretches to the row', box('vrule').w === 1 && box('vrule').h === box('row').h);
click_test_id('toggle');
check('a label is drawn centred in the divider', !!find_text('Section') && box('split').h > 1);
screenshot('/tmp/gpuix-ui-divider.png');
click_test_id('toggle');
check('removing the label restores the plain rule', !find_text('Section') && box('split').h === 1);
finish('Divider', 4);
