<script lang="ts">
	import { ThemeProvider, Button, themes } from 'gpuix-fractalsvelte-ui';
	import Badge from 'gpuix-fractalsvelte-ui/Badge.svelte';
</script>

<ThemeProvider theme={themes.midnight}>
	<Button label="from package" />
	<Badge label="deep import" />
</ThemeProvider>
