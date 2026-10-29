import { mount_headless, click_test_id, click_at, press, type, find_text, find_test_id, bounds, focus, screenshot, all_text, check, finish } from 'gpuix-fractalsvelte/test';
import Harness from './TextInput.harness.svelte';

mount_headless(Harness, { width: 400, height: 460 });

check('label, hint and error render', [!!find_text('Name'), !!find_text('Shown under the field'), !!find_text('Enter a valid email')], [true, true, true]);

click_test_id('name-input');
type('ada');
check('typing reports each edit through onchange', all_text().includes('name:ada'));

press('enter');
check('enter calls onsubmit with the text', all_text().includes('submitted:ada'));

const field = bounds(find_test_id('name-field')!)!;
click_at(field.x + field.width - 4, field.y + field.height / 2);
type('k');
check('a click on the field padding focuses the input', all_text().includes('name:adak'));

click_test_id('clear');
check('controlled value: parent can clear it', all_text().includes('name:') && !all_text().includes('name:adak'));

click_test_id('locked-input');
type('zz');
check('disabled field ignores typing', all_text().includes('edits:0'));

focus(find_test_id('email-input')!);
type('x');
check('error field still takes input', all_text().includes('email:badx'));

screenshot('/tmp/gpuix-ui-textinput.png');
finish('TextInput', 7);
