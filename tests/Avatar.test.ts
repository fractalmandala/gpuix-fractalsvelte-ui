import 'gpuix-fractalsvelte';
import { mount_headless, click_test_id, find_text, find_test_id, bounds, screenshot, check, finish } from 'gpuix-fractalsvelte/test';
import Harness from './Avatar.harness.svelte';

mount_headless(Harness, { width: 500, height: 200 });

check('two-word name gives first and last initials', !!find_text('AL'));
check('sizes scale', bounds(find_test_id('av-lg')!)!.width > bounds(find_test_id('av-sm')!)!.width);
check('image replaces initials when src is set', !!find_test_id('photo-img') && !find_text('GH'));
click_test_id('rename');
check('rename updates initials', !!find_text('GH'));
click_test_id('rename');
check('single word uses its first letter', !!find_text('L'));
screenshot('/tmp/gpuix-ui-avatar.png');
finish('Avatar', 5);
