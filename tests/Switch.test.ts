import 'gpuix-fractalsvelte';
import { mount_headless, click_text, click_test_id, press, focus, find_text, find_test_id, bounds, screenshot, all_text, check, finish } from 'gpuix-fractalsvelte/test';
import Harness from './Switch.harness.svelte';

mount_headless(Harness, { width: 360, height: 300 });

const thumb_on_right = () => {
	const track = bounds(find_test_id('notify-track')!)!;
	const thumb = bounds(find_test_id('notify-thumb')!)!;
	return thumb.x > track.x + track.width / 2;
};

check('label and snippet children render', !!find_text('Notifications') && !!find_text('Snippet label'));

click_text('Notifications');
check('clicking the label turns it on', all_text().includes('notify:true') && thumb_on_right());

focus(find_test_id('notify')!);
press('space');
check('space turns it off while focused', all_text().includes('notify:false') && !thumb_on_right());

click_test_id('notify-track');
check('clicking the track turns it on', all_text().includes('notify:true'));

click_text('Locked');
check('disabled ignores clicks', all_text().includes('edits:0'));

screenshot('/tmp/gpuix-ui-switch.png');
finish('Switch', 5);
