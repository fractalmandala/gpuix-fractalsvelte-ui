<script lang="ts">
	import ThemeProvider from '../src/theme/ThemeProvider.svelte';
	import Button from '../src/components/Button.svelte';
	import Toast from '../src/components/Toast.svelte';
	import { toast, toasts } from '../src/components/toast.svelte.ts';
</script>

<ThemeProvider>
	<div style="display: flex; flex-direction: row; gap: 8px; padding: 16px">
		<Button label="Info" variant="outline" tone="neutral" testid="info" onclick={() => toast('Project saved', { title: 'Saved' })} />
		<Button label="Error" tone="danger" testid="err" onclick={() => toast('Upload failed', { title: 'Error', tone: 'danger', duration: 0 })} />
		<Button label="Short" testid="short" onclick={() => toast('Gone soon', { duration: 100 })} />
		<Button label="Sticky" testid="sticky" onclick={() => toast('Stays put', { tone: 'success', duration: 0 })} />
	</div>
	<div testId="count">toasts:{toasts.length}</div>
	<Toast testid="toaster" />
</ThemeProvider>
