<script lang="ts">
	import type { GpuixEvent } from 'gpuix-fractalsvelte';
	import { focus_element } from 'gpuix-fractalsvelte';
	import type { Size } from '../types.ts';

	let {
		value = '',
		onchange = undefined,
		placeholder = '',
		label = '',
		hint = '',
		error = '',
		rows = 3,
		maxRows = undefined,
		disabled = false,
		size = 'md',
		style = null,
		testid = null
	}: {
		value?: string;
		/** Called on every edit with the new text. */
		onchange?: (value: string) => void;
		placeholder?: string;
		/** Shown above the field. */
		label?: string;
		/** Shown under the field, unless `error` is set. */
		hint?: string;
		/** Shown under the field in the danger colour, in place of `hint`. */
		error?: string;
		/** Visible height in lines; the field grows with its text from here. */
		rows?: number;
		/** Stops growing at this many lines, then scrolls. Unset grows without limit. */
		maxRows?: number;
		/** Greys the field and ignores edits. */
		disabled?: boolean;
		size?: Size;
		style?: string | null;
		testid?: string | null;
	} = $props();

	let focused = $state(false);
	let input: Parameters<typeof focus_element>[0] = null;
</script>

<div class="root" {style} testId={testid}>
	{#if label}<div class="label">{label}</div>{/if}
	<div
		class="box {size}"
		class:on={!disabled}
		class:off={disabled}
		class:focused
		class:error={!!error}
		onclick={() => !disabled && input && focus_element(input)}
		testId={testid && `${testid}-box`}
	>
		<textarea
			class="inner {size}"
			{value}
			{placeholder}
			minRows={rows}
			maxRows={maxRows}
			readOnly={disabled}
			tabindex={disabled ? -1 : null}
			aria-label={label || null}
			onchange={(e: GpuixEvent & { value: string }) => onchange?.(e.value)}
			onfocus={() => (focused = true)}
			onblur={() => (focused = false)}
			{@attach (node) => (input = node)}
			testId={testid && `${testid}-input`}
		></textarea>
	</div>
	{#if error || hint}
		<div class="msg" class:error={!!error} testId={testid && `${testid}-msg`}>{error || hint}</div>
	{/if}
</div>

<style>
	.root {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}
	.label {
		font-size: var(--ui-text-sm);
		font-weight: 500;
		color: var(--ui-ink);
	}
	.box {
		display: flex;
		flex-direction: column;
		padding: 8px 10px;
		background-color: var(--ui-surface);
		border-width: 1px;
		border-color: var(--ui-border-strong);
		border-radius: var(--ui-radius-md);
	}
	.box.sm { border-radius: var(--ui-radius-sm); padding: 6px 8px; }
	.box.lg { border-radius: var(--ui-radius-lg); padding: 10px 12px; }
	.box.on { cursor: text; }
	.box.off { background-color: var(--ui-raised); opacity: 0.5; cursor: not-allowed; }
	.box.focused { border-color: var(--ui-ring); }
	.box.error { border-color: var(--ui-danger); }
	.inner {
		padding: 0;
		border-width: 0;
		background-color: #00000000;
		color: var(--ui-ink);
		font-family: var(--ui-font);
		font-size: var(--ui-text-md);
		line-height: 20px;
	}
	.inner.sm { font-size: var(--ui-text-sm); line-height: 18px; }
	.inner.lg { font-size: var(--ui-text-lg); line-height: 24px; }
	.msg {
		font-size: var(--ui-text-sm);
		color: var(--ui-ink-muted);
	}
	.msg.error { color: var(--ui-danger); }
</style>
