import { mount_headless, click_test_id, find_text, find_test_id, bounds, wait, screenshot, check, finish } from 'gpuix-fractalsvelte/test';
import Harness from './Progress.harness.svelte';

mount_headless(Harness, { width: 460, height: 230 });

const ratio = () => bounds(find_test_id('p-fill')!)!.width / bounds(find_test_id('p')!)!.width;
check('determinate fill starts at 40%', Math.abs(ratio() - 0.4) < 0.01);
click_test_id('inc');
click_test_id('inc');
check('clicks move the fill to 60%', Math.abs(ratio() - 0.6) < 0.01 && !!find_text('60%'));
for (let i = 0; i < 9; i++) click_test_id('dec');
check('values clamp at 0', ratio() < 0.01 && !!find_text('0%'));
const sweepStart = bounds(find_test_id('ind-fill')!)!.x;
await wait(400);
check('indeterminate segment moves', Math.abs(bounds(find_test_id('ind-fill')!)!.x - sweepStart) > 1);
screenshot('/tmp/gpuix-ui-progress.png');
finish('Progress', 4);
