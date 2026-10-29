import 'gpuix-fractalsvelte';
import {
	mount_headless,
	click_test_id,
	click_at,
	press,
	find_test_id,
	find_text,
	all_text,
	bounds,
	screenshot,
	clock_pause,
	clock_fast_forward,
	clock_resume,
	check,
	finish
} from 'gpuix-fractalsvelte/test';
import Harness from './Drawer.harness.svelte';

const { native } = mount_headless(Harness, { width: 600, height: 400 });
const { width, height } = native.getWindowSize();

const at = (id: string) => bounds(find_test_id(id)!)!;
const near = (a: number, b: number) => Math.abs(a - b) <= 1;
// The slide runs on the motion clock, so each open lands it before the next input.
const open = (id: string) => {
	click_test_id(id);
	clock_fast_forward(1000);
};

check('closed by default', !find_text('Settings'));

open('right');
check('opens from the right', !!find_text('Settings'));
screenshot('/tmp/gpuix-ui-drawer.png');

const scrim = at('d-scrim');
const panel = at('d');
check(
	'a right drawer sits flush with the right edge, full height, sm wide',
	[near(panel.x + panel.width, scrim.x + scrim.width), near(panel.height, scrim.height), find_test_id('d')!.style!.width],
	[true, true, 320]
);

click_test_id('inside');
check('a click inside keeps it open', !!find_text('Settings'));

click_at(10, 200);
check('a scrim click closes it', !find_text('Settings'));

click_test_id('left');
press('escape');
check('escape closes it', !find_text('Settings'));

open('right');
click_test_id('apply');
check('a footer action runs and closes it', all_text().includes('applied:1') && !find_text('Settings'));

open('bottom');
click_test_id('d-close');
check('the ✕ button closes it', !find_text('Settings'));

clock_pause();
click_test_id('left');
check('the panel starts off-screen, slid out to the left', at('d').x + at('d').width - 1 <= 0, true);
clock_fast_forward(1000);
check('and slides to the left edge', near(at('d').x, 0), true);
clock_resume();
press('escape');

open('bottom');
const sheet = at('d');
check(
	'a bottom sheet spans the window, sm tall',
	[near(sheet.width, width), find_test_id('d')!.style!.height, near(sheet.y + sheet.height, height)],
	[true, 240, true]
);
press('escape');

finish('Drawer', 11);
