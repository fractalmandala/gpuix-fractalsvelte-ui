import 'gpuix-fractalsvelte';
import { mount_headless, click_test_id, click_at, press, type, find_text, find_test_id, bounds, screenshot, all_text, check, finish } from 'gpuix-fractalsvelte/test';
import Harness from './TextArea.harness.svelte';

mount_headless(Harness, { width: 400, height: 500 });

check('label, hint and error render', [!!find_text('Notes'), !!find_text('Enter adds a line'), !!find_text('Too long')], [true, true, true]);

click_test_id('notes-input');
type('ab');
press('enter');
type('c');
check('enter inserts a newline and typing reports onchange', all_text().includes('chars:4'));

const box = bounds(find_test_id('notes-box')!)!;
click_at(box.x + box.width - 4, box.y + box.height - 4);
type('q');
check('a click on the box padding focuses the textarea', all_text().includes('chars:5'));

click_test_id('off-input');
type('zz');
check('disabled area ignores typing', all_text().includes('edits:0'));

screenshot('/tmp/gpuix-ui-textarea.png');
finish('TextArea', 4);
