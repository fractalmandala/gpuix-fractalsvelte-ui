import { mount_headless, click_test_id, click_at, press, find_text, all_text, screenshot, check, finish } from 'gpuix-fractalsvelte/test';
import Harness from './Modal.harness.svelte';

mount_headless(Harness, { width: 600, height: 400 });

check('closed by default', !find_text('Delete file?'));
click_test_id('open');
check('opens', !!find_text('Delete file?'));
screenshot('/tmp/gpuix-ui-modal.png');
click_test_id('inside');
check('click inside keeps it open', !!find_text('Delete file?'));
click_at(10, 390);
check('scrim click closes', !find_text('Delete file?'));
click_test_id('open');
press('escape');
check('escape closes', !find_text('Delete file?'));
click_test_id('open');
click_test_id('confirm');
check('footer action runs and closes', all_text().includes('confirmed:1') && !find_text('Delete file?'));
click_test_id('open');
click_test_id('m-close');
check('close button closes', !find_text('Delete file?'));
finish('Modal', 7);
