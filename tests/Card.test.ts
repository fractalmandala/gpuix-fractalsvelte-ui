import 'gpuix-fractalsvelte';
import { mount_headless, click_test_id, focus, press, find_test_id, find_text, all_text, check, screenshot, finish } from 'gpuix-fractalsvelte/test';
import Harness from './Card.harness.svelte';

mount_headless(Harness, { width: 360, height: 300 });

const counts = (want: string) => all_text().includes(want);

check('title and description render', !!find_text('Project') && !!find_text('Last edited 2h ago'));
click_test_id('card');
check('a click runs onclick', counts('1/0/0/0'));
focus(find_test_id('card')!);
press('enter');
check('enter runs onclick', counts('2/0/0/0'));
press('space');
check('space runs onclick', counts('3/0/0/0'));
click_test_id('star');
check('a header button runs its own click only', counts('3/1/0/0'));
click_test_id('open');
check('a footer button runs its own click only', counts('3/1/1/0'));
click_test_id('static');
check('a card that is not clickable ignores clicks', counts('3/1/1/0'));
screenshot('/tmp/gpuix-ui-card.png');
finish('Card', 7);
