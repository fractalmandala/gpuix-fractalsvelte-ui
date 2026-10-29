import { mount_headless, click_at, click_test_id, press, focus, find_test_id, find_text, bounds, all_text, screenshot, check, finish } from 'gpuix-fractalsvelte/test';
import Harness from './Select.harness.svelte';

mount_headless(Harness, { width: 320, height: 330 });

check('placeholder shows with no value', !!find_text('Pick a fruit'));
check('list is closed by default', !find_text('Banana'));
click_test_id('fruit-trigger');
check('click opens the list', !!find_text('Banana'));
screenshot('/tmp/gpuix-ui-select.png');
click_test_id('fruit-option-cherry');
check('click picks an option and closes', all_text().includes('fruit:cherry') && !find_text('Banana'));
check('chosen label replaces the placeholder', !!find_text('Cherry') && !find_text('Pick a fruit'));

click_test_id('fruit-trigger');
click_test_id('fruit-option-date');
check('disabled option ignores clicks and keeps the list open', all_text().includes('fruit:cherry') && !!find_text('Banana'));
click_at(4, 4);
check('press outside closes the list', !find_text('Banana') && all_text().includes('fruit:cherry'));

focus(find_test_id('fruit-trigger')!);
press('enter');
check('enter opens from the keyboard', !!find_text('Banana'));
press('down');
press('down');
press('enter');
check('down skips a disabled option and enter picks', all_text().includes('fruit:elder') && !find_text('Banana'));

press('down');
check('down reopens the list from the chosen item', !!find_text('Banana'));
press('up');
press('up');
press('escape');
check('escape closes without changing the value', !find_text('Banana') && all_text().includes('fruit:elder'));

click_test_id('off-trigger');
check('disabled select does not open', !find_text('Banana'));
check('disabled select keeps its value', all_text().includes('off:0'));

focus(find_test_id('zone-trigger')!);
press('enter');
for (let i = 0; i < 10; i++) press('down');
const item = bounds(find_test_id('zone-option-opt11')!)!;
const panel = bounds(find_test_id('zone-panel')!)!;
check('the highlighted row sits below the first rows', item.y > panel.y + panel.height);
press('enter');
check('long list picks by keyboard', all_text().includes('zone:opt11'));
finish('Select', 15);
