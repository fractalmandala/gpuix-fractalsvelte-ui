import 'gpuix-fractalsvelte';
import { mount_headless, click_test_id, click_text, press, find_test_id, focus, all_text, find_text, screenshot, check, finish } from 'gpuix-fractalsvelte/test';
import Harness from './Breadcrumbs.harness.svelte';

mount_headless(Harness, { width: 420, height: 200 });
const text = () => all_text().join(' ');

check('separators render between crumbs', !!find_text('/') && !!find_text('›'));
check('starts at home', text().includes('at:Home'));
click_text('Projects');
check('click runs the crumb action', text().includes('visits:1 at:Projects'));
click_text('Fractal');
check('current crumb is not a link', text().includes('visits:1'));
focus(find_test_id('crumbs-0')!);
press('enter');
check('enter activates a focused link', text().includes('visits:2 at:Home'));
click_text('Settings');
check('second breadcrumb row works', text().includes('visits:3 at:Settings'));
click_text('Billing');
check('last crumb is not a link', text().includes('visits:3'));
screenshot('/tmp/gpuix-ui-breadcrumbs.png');
finish('Breadcrumbs', 7);
