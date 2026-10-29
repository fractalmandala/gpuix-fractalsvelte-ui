import { render_hot } from 'gpuix-fractalsvelte';

render_hot(new URL('./Gallery.svelte', import.meta.url), {
	title: 'gpuix-fractalsvelte-ui gallery',
	width: 1100,
	height: 760
});
