import { mount_headless, click_test_id, find_test_id, bounds, wait, screenshot, check, finish } from 'gpuix-fractalsvelte/test';
import Harness from './Spinner.harness.svelte';

mount_headless(Harness, { width: 500, height: 160 });

check('spinner renders', !!find_test_id('live'));
const dotStyles = () => JSON.stringify(find_test_id('live')!.children!.map((c) => c.style));
const before = dotStyles();
await wait(300);
check('the timer animates the ring', dotStyles() !== before);
check('sm is smaller than lg', bounds(find_test_id('sp-sm')!)!.width < bounds(find_test_id('sp-lg')!)!.width);
screenshot('/tmp/gpuix-ui-spinner.png');
click_test_id('toggle');
check('unmounting removes it', !find_test_id('live'));
await wait(300);
check('no timer left behind after unmount', !find_test_id('live'));
finish('Spinner', 5);
