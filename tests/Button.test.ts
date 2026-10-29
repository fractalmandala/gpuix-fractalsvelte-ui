import 'gpuix-fractalsvelte';
import { mount_headless, click_test_id, find_text, all_text, check, finish } from 'gpuix-fractalsvelte/test';
import Harness from './Button.harness.svelte';

mount_headless(Harness, { width: 500, height: 200 });

click_test_id('add');
click_test_id('add');
click_test_id('off');
click_test_id('busy');

check('enabled button fires onclick', all_text().includes('count:2'));
check('label renders', !!find_text('Add'));
check('children snippet renders', !!find_text('Snippet'));
check('loading hides label', !find_text('Busy'));
finish('Button', 4);
