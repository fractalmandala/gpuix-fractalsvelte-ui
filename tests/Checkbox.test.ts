import 'gpuix-fractalsvelte';
import { mount_headless, click_text, click_test_id, press, focus, find_text, find_test_id, screenshot, all_text, check, finish } from 'gpuix-fractalsvelte/test';
import Harness from './Checkbox.harness.svelte';

mount_headless(Harness, { width: 360, height: 420 });

check('label and snippet children render', !!find_text('Accept terms') && !!find_text('Snippet label'));

click_text('Accept terms');
check('clicking the label toggles it', all_text().includes('agree:true'));

focus(find_test_id('agree')!);
press('space');
check('space toggles while focused', all_text().includes('agree:false'));

click_test_id('mixed-box');
check('a click on an indeterminate box passes the next state and clears the dash', all_text().includes('mixed:false/true'));

click_text('Locked');
check('disabled ignores clicks', all_text().includes('edits:0'));

screenshot('/tmp/gpuix-ui-checkbox.png');
finish('Checkbox', 5);
