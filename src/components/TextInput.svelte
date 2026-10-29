<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { GpuixEvent } from 'gpuix-fractalsvelte';
	import { focus_element } from 'gpuix-fractalsvelte';
	import type { Size } from '../types.ts';

	let {
		value = '',
		onchange = undefined,
		onsubmit = undefined,
		placeholder = '',
		label = '',
		hint = '',
		error = '',
		disabled = false,
		size = 'md',
		leading = undefined,
		trailing = undefined,
		style = null,
		testid = null
	}: {
		value?: string;
		/** Called on every edit with the new text. */
		onchange?: (value: string) => void;
		/** Called on Enter with the current text. */
		onsubmit?: (value: string) => void;
		placeholder?: string;
		/** Shown above the field. */
		label?: string;
		/** Shown under the field, unless `error` is set. */
		hint?: string;
		/** Shown under the field in the danger colour, in place of `hint`. */
		error?: string;
		/** Greys the field and ignores edits. */
		disabled?: boolean;
		size?: Size;
		/** Snippet inside the field, before the text. */
		leading?: Snippet;
		/** Snippet inside the field, after the text. */
		trailing?: Snippet;
		style?: string | null;
		testid?: string | null;
	} = $props();

	let focused = $state(false);
	let input: Parameters<typeof focus_element>[0] = null;

	function focus_field() {
		if (!disabled && input) focus_element(input);
	}
</script>

<div class="root" {style} testId={testid}>
	{#if label}<div class="label">{label}</div>{/if}
	<div
		class="field {size}"
		class:on={!disabled}
		class:off={disabled}
		class:focused
		class:error={!!error}
		hitbox="self"
		onclick={focus_field}
		testId={testid && `${testid}-field`}
	>
		{#if leading}<div class="adorn">{@render leading()}</div>{/if}
		<input
			class="inner {size}"
			{value}
			{placeholder}
			readOnly={disabled}
			tabindex={disabled ? -1 : null}
			aria-label={label || null}
			onchange={(e: GpuixEvent & { value: string }) => onchange?.(e.value)}
			onsubmit={(e: GpuixEvent & { value: string }) => onsubmit?.(e.value)}
			onfocus={() => (focused = true)}
			onblur={() => (focused = false)}
			{@attach (node) => (input = node)}
			testId={testid && `${testid}-input`}
		/>
		{#if trailing}<div class="adorn">{@render trailing()}</div>{/if}
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
	.field {
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: 8px;
		padding: 0 10px;
		background-color: var(--ui-surface);
		border-width: 1px;
		border-color: var(--ui-border-strong);
		border-radius: var(--ui-radius-md);
	}
	.field.sm { height: 26px; border-radius: var(--ui-radius-sm); }
	.field.md { height: 32px; }
	.field.lg { height: 40px; border-radius: var(--ui-radius-lg); padding: 0 12px; }
	.field.on { cursor: text; }
	.field.off { background-color: var(--ui-raised); opacity: 0.5; cursor: not-allowed; }
	.field.focused { border-color: var(--ui-ring); }
	.field.error { border-color: var(--ui-danger); }
	.inner {
		flex-grow: 1;
		min-width: 0;
		height: 20px;
		padding: 0;
		border-width: 0;
		background-color: #00000000;
		color: var(--ui-ink);
		font-family: var(--ui-font);
		font-size: var(--ui-text-md);
	}
	.inner.sm { height: 16px; font-size: var(--ui-text-sm); }
	.inner.lg { height: 24px; font-size: var(--ui-text-lg); }
	.adorn {
		display: flex;
		flex-direction: row;
		align-items: center;
		color: var(--ui-ink-muted);
		font-size: var(--ui-text-sm);
	}
	.msg {
		font-size: var(--ui-text-sm);
		color: var(--ui-ink-muted);
	}
	.msg.error { color: var(--ui-danger); }
</style>
