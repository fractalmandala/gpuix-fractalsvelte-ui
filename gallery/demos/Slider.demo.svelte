<script lang="ts">
	import Slider from '../../src/components/Slider.svelte';
	let volume = $state(40);
	let brightness = $state(70);
	let level = $state(4);
</script>

<div style="display: flex; flex-direction: column; gap: 20px; padding: 8px; width: 360px">
	<div style="display: flex; flex-direction: column; gap: 8px">
		<div style="display: flex; flex-direction: row; justify-content: space-between; color: var(--text-secondary); font-size: var(--text-sm)">
			<div>Volume</div><div>{volume}</div>
		</div>
		<Slider value={volume} onchange={(v) => (volume = v)} />
	</div>
	<div style="display: flex; flex-direction: column; gap: 8px">
		<div style="color: var(--text-secondary); font-size: var(--text-sm)">Step 2 of 0–10 · sm</div>
		<Slider value={level} min={0} max={10} step={2} size="h-sm" onchange={(v) => (level = v)} />
	</div>
	<div style="display: flex; flex-direction: column; gap: 8px">
		<div style="color: var(--text-secondary); font-size: var(--text-sm)">Large</div>
		<Slider value={brightness} size="h-bs" onchange={(v) => (brightness = v)} />
	</div>
	<div style="display: flex; flex-direction: column; gap: 8px">
		<div style="color: var(--text-secondary); font-size: var(--text-sm)">Disabled</div>
		<Slider value={30} disabled />
	</div>
</div>
