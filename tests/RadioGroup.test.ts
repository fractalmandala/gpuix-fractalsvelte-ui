import 'gpuix-fractalsvelte';
import { mount_headless, click_test_id, press, focus, find_test_id, find_text, all_text, screenshot, check, finish } from 'gpuix-fractalsvelte/test';
import Harness from './RadioGroup.harness.svelte';

mount_headless(Harness, { width: 480, height: 260 });

check('initial value is checked', all_text().includes('plan:monthly'));
click_test_id('plan-yearly');
check('click selects an option', all_text().includes('plan:yearly'));
click_test_id('plan-lifetime');
check('disabled option ignores clicks', all_text().includes('plan:yearly'));
focus(find_test_id('plan-yearly')!);
screenshot('/tmp/gpuix-ui-radiogroup.png');

press('down');
check('arrow down wraps past the disabled option', all_text().includes('plan:monthly'));
press('up');
check('arrow up wraps back, skipping the disabled option', all_text().includes('plan:yearly'));

focus(find_test_id('view-board')!);
press('space');
check('space selects the focused option', all_text().includes('view:board'));
press('left');
check('left moves to the previous row option', all_text().includes('view:grid'));
press('right');
check('right moves to the next row option', all_text().includes('view:board'));

click_test_id('off-monthly');
click_test_id('off-lifetime');
check('group disabled ignores clicks', all_text().includes('off:0'));
finish('RadioGroup', 9);
