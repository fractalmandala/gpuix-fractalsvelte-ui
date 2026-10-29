import {
	mount_headless,
	click_test_id,
	click_text,
	click_at,
	press,
	find_test_id,
	find_text,
	all_text,
	bounds,
	center,
	screenshot,
	check,
	finish
} from 'gpuix-fractalsvelte/test';
import Harness from './ContextMenu.harness.svelte';

const { native } = mount_headless(Harness, { width: 600, height: 400 });
const { height } = native.getWindowSize();

const menu = (id: string) => find_test_id(`${id}-menu`)!;

check('closed by default', !find_text('Copy'));

const pointer = center(find_test_id('cm')!);
click_test_id('cm', { button: 2 });
check('a right click opens the menu', !!find_text('Copy'));
screenshot('/tmp/gpuix-ui-contextmenu.png');
check('anchored at the pointer', [menu('cm').style!.left, menu('cm').style!.top], [pointer.x, pointer.y]);

click_text('Paste');
check('an item runs and closes the menu', all_text().includes('paste') && !find_text('Copy'));

click_test_id('cm', { button: 2 });
press('escape');
check('escape closes it', !find_text('Copy'));

click_test_id('cm', { button: 2 });
click_at(580, 390);
check('a press outside closes it', !find_text('Copy'));

click_test_id('cm', { button: 2 });
click_text('Locked');
check('a disabled item ignores the click and stays open', !!find_text('Locked') && !all_text().includes('locked'));
press('escape');

click_test_id('cm', { button: 2 });
press('down');
press('down');
press('down');
press('enter');
check('arrow keys skip the rule and disabled item, and enter runs the one active', all_text().includes('delete') && !find_text('Copy'));

click_test_id('cm', { modifiers: 'ctrl' });
check('ctrl+click opens it too, for macOS secondary clicks', !!find_text('Copy'));
press('escape');

click_test_id('edge', { button: 2 });
const last = bounds(find_text('Delete')!)!;
check('near the bottom the menu is pulled back inside the window', last.y + last.height <= height, true);
press('escape');

finish('ContextMenu', 10);
