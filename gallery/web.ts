/**
 * The browser entry: the gallery, rendered by GPUI's WebAssembly build onto a canvas.
 * The window options are inert here; the canvas is sized to the page.
 */

import { render } from 'gpuix-fractalsvelte';
import Gallery from './Gallery.svelte';

render(Gallery, { title: 'gpuix-fractalsvelte-ui gallery', width: 1100, height: 760 });
