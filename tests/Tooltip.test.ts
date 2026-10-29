import { mount_headless, click_test_id, hover, find_test_id, find_text, all_text, screenshot, wait, check, finish } from 'gpuix-fractalsvelte/test';
import Harness from './Tooltip.harness.svelte';

mount_headless(Harness, { width: 600, height: 400 });

check('no tip before hover', !find_text('Save (cmd-s)'));

hover(find_test_id('trigger')!);
check('and none yet inside the delay', !find_text('Save (cmd-s)'));
await wait(120);
check('hover shows it after the delay', !!find_text('Save (cmd-s)'));
screenshot('/tmp/gpuix-ui-tooltip.png');

click_test_id('trigger');
check('the trigger still takes its own click', all_text().includes('clicks:1') && !!find_text('Save (cmd-s)'));

hover({ x: 2, y: 390 });
await wait(150);
check('leaving the trigger hides it', !find_text('Save (cmd-s)'));

finish('Tooltip', 5);
