import { mount_headless, find_text, check, finish } from 'gpuix-fractalsvelte/test';
import * as ui from 'gpuix-fractalsvelte-ui';
import Harness from './Exports.harness.svelte';

mount_headless(Harness, { width: 400, height: 200 });
check('index exports every component', Object.keys(ui).filter((k) => /^[A-Z]/.test(k)).length >= 38);
check('package-name imports render', !!find_text('from package') && !!find_text('deep import'));
finish('Exports', 2);
