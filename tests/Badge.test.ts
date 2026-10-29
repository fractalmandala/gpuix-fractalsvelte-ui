import 'gpuix-fractalsvelte';
import { mount_headless, click_test_id, find_text, find_test_id, bounds, screenshot, check, finish } from 'gpuix-fractalsvelte/test';
import Harness from './Badge.harness.svelte';

mount_headless(Harness, { width: 500, height: 240 });

check('variants render', !!find_text('info') && !!find_text('warning') && !!find_text('danger'));
check('count starts at 0', !!find_text('new 0'));
click_test_id('add');
click_test_id('add');
check('parent state drives the label', !!find_text('new 2'));
check('sm is shorter than md', bounds(find_test_id('sm')!)!.height < bounds(find_test_id('md')!)!.height);
screenshot('/tmp/gpuix-ui-badge.png');
finish('Badge', 4);
