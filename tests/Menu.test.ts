import 'gpuix-fractalsvelte';
import { mount_headless, click_test_id, click_text, press, find_test_id, focus, all_text, find_text, screenshot, check, finish } from 'gpuix-fractalsvelte/test';
import Harness from './Menu.harness.svelte';

mount_headless(Harness, { width: 480, height: 240 });
const text = () => all_text().join(' ');

check('closed by default', !find_text('Rename'));
click_text('Actions');
check('click on the trigger opens', !!find_text('Rename') && text().includes('open:true'));
screenshot('/tmp/gpuix-ui-menu.png');
click_text('Archive');
check('disabled item ignores clicks', text().includes('open:true') && text().includes('picked:none'));
click_text('Duplicate');
check('click selects and closes', text().includes('picked:duplicate') && text().includes('open:false') && !find_text('Rename'));

click_text('Actions');
press('down');
press('down');
press('enter');
check('down skips separators and disabled, enter selects', text().includes('picked:delete') && !find_text('Rename'));

click_text('Actions');
press('escape');
check('escape closes without selecting', text().includes('open:false') && text().includes('picked:delete'));

focus(find_test_id('menu-trigger')!);
press('down');
check('down opens from the keyboard', !!find_text('Rename'));
press('enter');
check('enter picks the first item', text().includes('picked:rename') && !find_text('Rename'));

focus(find_test_id('menu-trigger')!);
press('enter');
press('up');
press('enter');
check('up wraps to the last enabled item', text().includes('picked:delete'));

click_text('More');
check('button trigger opens the menu', !!find_text('Copy link'));
click_text('Copy link');
check('item from a button trigger selects', text().includes('picked:copy'));
finish('Menu', 11);
