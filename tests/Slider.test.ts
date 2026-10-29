import { mount_headless, click_at, drag, focus, press, bounds, center, find_test_id, all_text, screenshot, check, finish } from 'gpuix-fractalsvelte/test';
import Harness from './Slider.harness.svelte';

mount_headless(Harness, { width: 320, height: 200 });

const track = bounds(find_test_id('vol-track')!)!;
check('initial value renders', all_text().includes('vol:40'));
click_at(track.x + track.width * 0.25, track.y + track.height / 2);
check('click on the track sets the value', all_text().includes('vol:25'));
screenshot('/tmp/gpuix-ui-slider.png');

drag(center(find_test_id('vol-thumb')!), { x: track.x + track.width * 0.8, y: track.y + track.height / 2 });
check('dragging the thumb sets the value', all_text().includes('vol:80'));

focus(find_test_id('vol')!);
press('left');
check('left arrow steps down by one', all_text().includes('vol:79'));
press('home');
check('home jumps to min', all_text().includes('vol:0'));
press('end');
check('end jumps to max', all_text().includes('vol:100'));
press('down');
check('down arrow steps down', all_text().includes('vol:99'));

const st = bounds(find_test_id('stepped-track')!)!;
click_at(st.x + st.width * 0.52, st.y + st.height / 2);
check('values snap to the step', all_text().includes('stepped:6'));
focus(find_test_id('stepped')!);
press('right');
check('keyboard steps by step size', all_text().includes('stepped:8'));
press('right');
press('right');
check('keyboard clamps at max', all_text().includes('stepped:10'));

const off = bounds(find_test_id('off-track')!)!;
click_at(off.x + off.width * 0.1, off.y + off.height / 2);
check('disabled ignores clicks', all_text().includes('off:0'));
finish('Slider', 11);
