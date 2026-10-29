import { mount_headless, click_test_id, find_test_id, bounds, check, screenshot, finish } from 'gpuix-fractalsvelte/test';
import Harness from './Grid.harness.svelte';

mount_headless(Harness, { width: 400, height: 220 });

const box = (id: string) => {
	const b = bounds(find_test_id(id)!)!;
	return { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height) };
};

const c = [0, 1, 2, 3, 4, 5].map((i) => box(`c${i}`));
check('three columns: first row shares one y', c[0].y === c[1].y && c[1].y === c[2].y);
check('three columns: tracks are equal width and separated by the 4px gap', c[1].x - c[0].x === c[2].x - c[1].x && c[1].x - (c[0].x + c[0].w) === 4);
check('the fourth item starts a second row', c[3].y > c[0].y && c[3].x === c[0].x);
screenshot('/tmp/gpuix-ui-grid.png');
click_test_id('toggle');
const d = [0, 1, 2, 3].map((i) => box(`c${i}`));
check('two columns: the third item wraps to the next row', d[2].y > d[0].y && d[2].x === d[0].x);
finish('Grid', 4);
