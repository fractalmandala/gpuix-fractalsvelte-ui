import 'gpuix-fractalsvelte';
import { mount_headless, click_test_id, press, focus, find_text, find_test_id, screenshot, check, finish } from 'gpuix-fractalsvelte/test';
import Harness from './Alert.harness.svelte';

mount_headless(Harness, { width: 460, height: 300 });

check('title and body render', !!find_text('Saved') && !!find_text('Your changes are live.'));
check('alert without onclose has no dismiss', !find_test_id('err-close'));
click_test_id('saved-close');
check('dismiss click removes the alert', !find_text('Saved'));
focus(find_test_id('warn-close')!);
press('enter');
check('keyboard dismiss removes the alert', !find_text('Disk almost full'));
click_test_id('restore');
check('restore brings both back', !!find_text('Saved') && !!find_text('Disk almost full'));
screenshot('/tmp/gpuix-ui-alert.png');
finish('Alert', 5);
