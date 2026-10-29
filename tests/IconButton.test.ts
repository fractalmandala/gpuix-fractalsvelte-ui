import 'gpuix-fractalsvelte';
import { mount_headless, click_test_id, focus, hover, press, find_text, find_test_id, all_text, screenshot, check, wait, finish } from 'gpuix-fractalsvelte/test';
import Harness from './IconButton.harness.svelte';

mount_headless(Harness, { width: 400, height: 140 });

click_test_id('plus');
click_test_id('plus');
check('click runs onclick', all_text().join(' ').includes('count:2'));
click_test_id('off');
check('disabled ignores click', all_text().join(' ').includes('count:2'));
focus(find_test_id('close')!);
press('enter');
check('enter activates focused button', all_text().join(' ').includes('closed:1'));
focus(find_test_id('plus')!);
press('space');
check('space activates focused button', all_text().join(' ').includes('count:3'));
check('glyph renders', !!find_text('✕'));
check('tooltip hidden before hover', !find_text('Add'));
hover(find_test_id('plus')!);
await wait(400);
check('tooltip shows after hover', !!find_text('Add'));
screenshot('/tmp/gpuix-ui-iconbutton.png');
finish('IconButton', 7);
