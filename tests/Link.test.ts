import 'gpuix-fractalsvelte';
import { mount_headless, click_test_id, focus, press, hover, wait, find_test_id, find_text, all_text, screenshot, check, finish } from 'gpuix-fractalsvelte/test';
import Harness from './Link.harness.svelte';

mount_headless(Harness, { width: 400, height: 150 });

const state = () => all_text().join(' ');

click_test_id('docs');
check('click runs onclick', state().includes('last:docs clicks:1'));
click_test_id('del');
check('tone variant is still clickable', state().includes('last:del clicks:2'));
click_test_id('off');
check('disabled link ignores click', state().includes('clicks:2'));
focus(find_test_id('more')!);
press('enter');
check('enter activates focused link', state().includes('last:more clicks:3'));
focus(find_test_id('docs')!);
press('space');
check('space activates focused link', state().includes('last:docs clicks:4'));
check('snippet children render', !!find_text('Read more →'));
hover(find_test_id('docs')!);
await wait(50);
screenshot('/tmp/gpuix-ui-link.png');
finish('Link', 6);
