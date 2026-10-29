import 'gpuix-fractalsvelte';
import { mount_headless, click_test_id, all_text, find_text, screenshot, check, finish } from 'gpuix-fractalsvelte/test';
import Harness from './Pagination.harness.svelte';

mount_headless(Harness, { width: 480, height: 200 });
const text = () => all_text().join(' ');

check('windows the pages around the current one', !!find_text('…') && !!find_text('10'));
check('first page is always shown', !!find_text('1'));
click_test_id('pg-4');
check('click jumps to a page', text().includes('page:4'));
click_test_id('pg-next');
check('next advances', text().includes('page:5'));
click_test_id('pg-prev');
click_test_id('pg-prev');
check('previous steps back', text().includes('page:3'));
click_test_id('pg-10');
check('last page reachable', text().includes('page:10'));
click_test_id('pg-next');
check('next is disabled on the last page', text().includes('page:10'));
click_test_id('pg-1');
check('first page reachable', text().includes('page:1'));
click_test_id('pg-prev');
check('previous is disabled on the first page', text().includes('page:1'));
click_test_id('sm-2');
check('small size works', text().includes('small:2'));
screenshot('/tmp/gpuix-ui-pagination.png');
finish('Pagination', 10);
