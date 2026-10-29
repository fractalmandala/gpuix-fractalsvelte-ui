<script lang="ts">
	import Button from '../../src/components/Button.svelte';
	import Toast from '../../src/components/Toast.svelte';
	import { toast, toasts, dismiss } from '../../src/components/toast.svelte.ts';
</script>

<div style="display: flex; flex-direction: column; gap: 16px">
	<div style="display: flex; flex-direction: row; gap: 8px; align-items: center">
		<Button label="Accent" variant="themed" onclick={() => toast('A new version is ready to install.', { title: 'Update', variant: 'themed' })} />
		<Button label="Neutral" variant="secondary" onclick={() => toast('Changes are saved to this device.', { title: 'Saved' })} />
		<Button label="Success" variant="success" onclick={() => toast('Your export finished in 4 seconds.', { title: 'Export complete', variant: 'success' })} />
		<Button label="Warn" variant="warning" onclick={() => toast('Storage is 90% full.', { title: 'Heads up', variant: 'warning' })} />
		<Button label="Danger" variant="danger" onclick={() => toast('The upload stopped. Check your connection.', { title: 'Upload failed', variant: 'danger', duration: 0 })} />
	</div>
	<div style="display: flex; flex-direction: row; gap: 8px; align-items: center">
		<Button label="Clear all" variant="ghost" size="h-md" onclick={() => toasts.forEach((t) => dismiss(t.id))} />
		<div style="font-size: var(--text-sm); color: var(--text-secondary)">{toasts.length} showing · the danger toast stays until closed</div>
	</div>
	<Toast />
</div>
