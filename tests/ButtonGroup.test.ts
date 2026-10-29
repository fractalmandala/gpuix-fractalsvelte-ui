import { mount_headless, click_test_id, focus, press, find_text, find_test_id, bounds, all_text, screenshot, check, finish } from 'gpuix-fractalsvelte/test';
import Harness from './ButtonGroup.harness.svelte';

mount_headless(Harness, { width: 420, height: 200 });

const state = () => all_text().join(' ');

check('value shows as selected', state().includes('range:week'));
click_test_id('range-month');
check('click selects a segment', state().includes('range:month'));
click_test_id('range-year');
check('disabled segment ignores click', state().includes('range:month'));
focus(find_test_id('range')!);
press('right');
check('right arrow wraps past disabled to day', state().includes('range:day'));
press('left');
check('left arrow wraps back to month', state().includes('range:month'));
click_test_id('left');
check('attached child buttons fire', state().includes('picks:4'));
check('attached children render', !!find_text('Centre') && !!find_text('Right'));
const box = (id: string) => bounds(find_test_id(id)!)!;
const [l, c, r] = [box('left'), box('centre'), box('right')];
check('attached buttons overlap their borders by 1px', [c.x, r.x], [l.x + l.width - 1, c.x + c.width - 1]);
screenshot('/tmp/gpuix-ui-buttongroup.png');
finish('ButtonGroup', 8);
