<script lang="ts">
	import ThemeProvider from '../src/theme/ThemeProvider.svelte';
	import Slider from '../src/components/Slider.svelte';

	let volume = $state(40);
	let stepped = $state(4);
	let offHits = $state(0);
</script>

<ThemeProvider>
	<div style="display: flex; flex-direction: column; gap: 20px; padding: 16px">
		<Slider value={volume} onchange={(v) => (volume = v)} testid="vol" />
		<Slider value={stepped} min={0} max={10} step={2} onchange={(v) => (stepped = v)} testid="stepped" />
		<Slider value={70} size="sm" disabled testid="off" onchange={() => offHits++} />
		<div>vol:{volume}</div>
		<div>stepped:{stepped}</div>
		<div>off:{offHits}</div>
	</div>
</ThemeProvider>
