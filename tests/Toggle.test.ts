import 'gpuix-fractalsvelte';
import { mount_headless, click_test_id, focus, press, find_test_id, all_text, screenshot, check, finish } from 'gpuix-fractalsvelte/test';
import Harness from './Toggle.harness.svelte';

mount_headless(Harness, { width: 400, height: 120 });

const state = () => all_text().join(' ');

check('starts unpressed', state().includes('bold:false'));
click_test_id('bold');
check('click presses', state().includes('bold:true'));
click_test_id('bold');
check('click releases', state().includes('bold:false'));
focus(find_test_id('wrap')!);
press('space');
check('space presses focused toggle', state().includes('wrap:true'));
press('enter');
check('enter releases focused toggle', state().includes('wrap:false'));
click_test_id('lock');
check('disabled toggle ignores click', state().includes('lock:false'));
click_test_id('bold');
screenshot('/tmp/gpuix-ui-toggle.png');
finish('Toggle', 6);
