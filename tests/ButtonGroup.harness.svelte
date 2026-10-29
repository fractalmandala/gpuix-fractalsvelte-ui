<script lang="ts">
	import ThemeProvider from '../src/theme/ThemeProvider.svelte';
	import Button from '../src/components/Button.svelte';
	import ButtonGroup from '../src/components/ButtonGroup.svelte';
	type Range = 'day' | 'week' | 'month' | 'year';
	let range = $state<Range>('week');
	let picks = $state(0);
</script>

<ThemeProvider>
	<div style="display: flex; flex-direction: column; gap: 12px; padding: 16px">
		<ButtonGroup
			testid="range"
			options={[
				{ value: 'day', label: 'Day' },
				{ value: 'week', label: 'Week' },
				{ value: 'month', label: 'Month' },
				{ value: 'year', label: 'Year', disabled: true }
			]}
			value={range}
			onchange={(v: Range) => { range = v; picks++; }}
		/>
		<ButtonGroup testid="align">
			{#snippet children()}
				<Button variant="outline" tone="neutral" size="sm" label="Left" testid="left" onclick={() => picks++} />
				<Button variant="outline" tone="neutral" size="sm" label="Centre" testid="centre" onclick={() => picks++} />
				<Button variant="outline" tone="neutral" size="sm" label="Right" testid="right" onclick={() => picks++} />
			{/snippet}
		</ButtonGroup>
		<Button label="Alone" testid="alone" />
	</div>
	<div testId="state">range:{range} picks:{picks}</div>
</ThemeProvider>
