<script lang="ts">
	let {
		style = null,
		testid = null
	}: {
		style?: string | null;
		testid?: string | null;
	} = $props();
</script>

<div class="spacer" {style} testId={testid}></div>

<style>
	.spacer { flex-grow: 1; }
</style>
