import {
	mount_headless,
	click_test_id,
	find_test_id,
	find_text,
	all_text,
	bounds,
	screenshot,
	wait,
	check,
	finish
} from 'gpuix-fractalsvelte/test';
import Harness from './Toast.harness.svelte';

const { native } = mount_headless(Harness, { width: 600, height: 400 });
const { width, height } = native.getWindowSize();
const near = (a: number, b: number) => Math.abs(a - b) <= 1;

check('no toasts by default', all_text().includes('toasts:0'));

click_test_id('info');
check('a toast shows its title and message', !!find_text('Saved') && !!find_text('Project saved'));

click_test_id('err');
click_test_id('sticky');
check('toasts stack: all three are visible', !!find_text('Upload failed') && !!find_text('Stays put'));
screenshot('/tmp/gpuix-ui-toast.png');

const stack = bounds(find_test_id('toaster')!)!;
check('the stack sits 16 px from the bottom-right corner', [near(stack.x + stack.width, width - 16), near(stack.y + stack.height, height - 16)], [true, true]);

click_test_id('toaster-close-1');
check('closing one leaves the others', !find_text('Project saved') && !!find_text('Upload failed'));

click_test_id('short');
check('a short toast appears', !!find_text('Gone soon'));
await wait(300);
check('and dismisses itself after its duration', !find_text('Gone soon'));
check('a sticky one stays', !!find_text('Stays put'));

click_test_id('toaster-close-3');
check('a close button dismisses a sticky toast', !find_text('Stays put') && all_text().includes('toasts:1'));

finish('Toast', 9);
