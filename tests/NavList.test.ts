import 'gpuix-fractalsvelte';
import { mount_headless, click_test_id, click_text, press, find_test_id, focus, all_text, find_text, screenshot, check, finish } from 'gpuix-fractalsvelte/test';
import Harness from './NavList.harness.svelte';

mount_headless(Harness, { width: 420, height: 320 });
const text = () => all_text().join(' ');

check('section headings render', !!find_text('Mail') && !!find_text('Account'));
check('badge renders', !!find_text('12'));
check('icon snippet renders', !!find_text('✉'));
click_text('Drafts');
check('click selects an item', text().includes('selected:drafts'));
click_text('Billing');
check('disabled item ignores clicks', text().includes('selected:drafts'));
focus(find_test_id('nav-drafts')!);
press('down');
check('down arrow selects next item', text().includes('selected:starred'));
focus(find_test_id('nav-starred')!);
press('down');
check('down crosses sections, skipping disabled', text().includes('selected:general'));
focus(find_test_id('nav-general')!);
press('down');
check('down wraps to the first item', text().includes('selected:inbox'));
focus(find_test_id('nav-inbox')!);
press('up');
check('up from the first item wraps to the last enabled', text().includes('selected:general'));
screenshot('/tmp/gpuix-ui-navlist.png');
finish('NavList', 9);
