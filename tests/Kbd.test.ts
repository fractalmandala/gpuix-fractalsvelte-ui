import 'gpuix-fractalsvelte';
import { mount_headless, press, find_text, find_test_id, all_text, screenshot, check, finish } from 'gpuix-fractalsvelte/test';
import Harness from './Kbd.harness.svelte';

mount_headless(Harness, { width: 400, height: 150 });

check('modifier glyphs render as caps', !!find_text('⌘') && !!find_text('K'));
check('named keys render as glyphs', !!find_text('⇧') && !!find_text('↵'));
check('chord is not shown as one string', !all_text().includes('cmd+k'));
press('cmd-k');
check('the chord triggers its shortcut', all_text().includes('saved:1'));
screenshot('/tmp/gpuix-ui-kbd.png');
finish('Kbd', 4);
