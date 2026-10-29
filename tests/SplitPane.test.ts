import 'gpuix-fractalsvelte';
import { mount_headless, find_test_id, bounds, center, drag, focus, press, all_text, check, screenshot, finish } from 'gpuix-fractalsvelte/test';
import Harness from './SplitPane.harness.svelte';

mount_headless(Harness, { width: 500, height: 400 });

const shows = (s: string) => all_text().some((t) => t.includes(s));
const size = (id: string) => bounds(find_test_id(id)!)!;
const grip = (id: string) => center(find_test_id(`${id}-divider`)!);

check('initial size sets the first pane width', Math.round(size('left').width) === 120);
check('the second pane takes the rest', Math.round(size('right').width) === Math.round(size('h').width) - 9 - 120);

const g = grip('h');
drag(g, { x: g.x + 40, y: g.y });
check('dragging right grows the first pane', shows('h:160'));
check('the first pane follows the drag', Math.round(size('left').width) === 160);

const g2 = grip('h');
drag(g2, { x: g2.x - 500, y: g2.y });
check('dragging past the minimum clamps to minFirst', shows('h:60'));

const g3 = grip('h');
drag(g3, { x: g3.x + 1000, y: g3.y });
const total = Math.round(size('h').width);
check('dragging past the far edge clamps to minSecond', shows(`h:${total - 9 - 60}`));

focus(find_test_id('h-divider')!);
press('left');
press('left');
check('arrow keys nudge the divider by 10px', shows(`h:${total - 9 - 80}`));

const v = grip('v');
drag(v, { x: v.x, y: v.y + 30 });
check('a column split drags vertically', shows('v:90'));
check('the column split sizes the top pane', Math.round(size('top').height) === 90);

screenshot('/tmp/gpuix-ui-splitpane.png');
finish('SplitPane', 9);
