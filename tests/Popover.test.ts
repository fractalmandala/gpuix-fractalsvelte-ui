import 'gpuix-fractalsvelte';
import { mount_headless, click_test_id, press, find_text, find_test_id, bounds, all_text, screenshot, check, finish } from 'gpuix-fractalsvelte/test';
import Harness from './Popover.harness.svelte';

mount_headless(Harness, { width: 600, height: 400 });

check('closed by default', !find_text('Rename'));

click_test_id('trigger');
check('the trigger opens it', !!find_text('Rename'));
screenshot('/tmp/gpuix-ui-popover.png');

click_test_id('rename');
check('an item runs and closes it', all_text().includes('picked:1 outside:0') && !find_text('Rename'));

click_test_id('trigger');
click_test_id('trigger');
check('the trigger toggles it closed', !find_text('Rename'));

click_test_id('trigger');
click_test_id('outside');
check('a press outside closes it', !find_text('Rename') && all_text().includes('picked:1 outside:1'));

click_test_id('trigger');
press('escape');
check('escape closes it', !find_text('Rename'));

click_test_id('point');
const pinned = bounds(find_test_id('at-content')!)!;
// The panel's own padding, border and the default 4px gap sit between the point and its content.
check('position hangs the panel at the given window point', pinned.x - 250 >= 0 && pinned.x - 250 <= 8 && pinned.y - 120 >= 0 && pinned.y - 120 <= 12);
finish('Popover', 7);
