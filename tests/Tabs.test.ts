import 'gpuix-fractalsvelte';
import { mount_headless, click_test_id, click_text, press, find_test_id, focus, all_text, screenshot, check, finish } from 'gpuix-fractalsvelte/test';
import Harness from './Tabs.harness.svelte';

mount_headless(Harness, { width: 480, height: 260 });
const text = () => all_text().join(' ');

check('first tab selected by default', text().includes('panel:overview'));
click_text('Billing');
check('disabled tab ignores clicks', text().includes('value:overview'));
click_text('Activity');
check('click selects a tab', text().includes('panel:activity'));
focus(find_test_id('tabs-activity')!);
press('right');
check('right arrow skips disabled tabs', text().includes('value:settings'));
focus(find_test_id('tabs-settings')!); // headless focus_element is a no-op; a window moves focus itself
press('left');
check('left arrow steps back', text().includes('value:activity'));
focus(find_test_id('tabs-overview')!);
press('left');
check('arrows wrap around', text().includes('value:settings'));
click_test_id('pills-two');
check('pill variant selects', text().includes('pill:two'));
screenshot('/tmp/gpuix-ui-tabs.png');
finish('Tabs', 7);
