<script lang="ts">
	import Button from '../../src/components/Button.svelte';
	import Toast from '../../src/components/Toast.svelte';
	import { toast, toasts, dismiss } from '../../src/components/toast.svelte.ts';
</script>

<div style="display: flex; flex-direction: column; gap: 16px">
	<div style="display: flex; flex-direction: row; gap: 8px; align-items: center">
		<Button label="Accent" tone="accent" onclick={() => toast('A new version is ready to install.', { title: 'Update', tone: 'accent' })} />
		<Button label="Neutral" variant="outline" tone="neutral" onclick={() => toast('Changes are saved to this device.', { title: 'Saved' })} />
		<Button label="Success" tone="success" onclick={() => toast('Your export finished in 4 seconds.', { title: 'Export complete', tone: 'success' })} />
		<Button label="Warn" tone="warn" onclick={() => toast('Storage is 90% full.', { title: 'Heads up', tone: 'warn' })} />
		<Button label="Danger" tone="danger" onclick={() => toast('The upload stopped. Check your connection.', { title: 'Upload failed', tone: 'danger', duration: 0 })} />
	</div>
	<div style="display: flex; flex-direction: row; gap: 8px; align-items: center">
		<Button label="Clear all" variant="ghost" tone="neutral" size="sm" onclick={() => toasts.forEach((t) => dismiss(t.id))} />
		<div style="font-size: var(--ui-text-sm); color: var(--ui-ink-muted)">{toasts.length} showing · the danger toast stays until closed</div>
	</div>
	<Toast />
</div>
