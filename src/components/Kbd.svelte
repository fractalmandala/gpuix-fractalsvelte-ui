<script lang="ts">
	let {
		keys = '',
		size = 'md',
		style = null,
		testid = null
	}: {
		/** A chord such as `cmd+k` or `shift+enter`; each part becomes one cap. */
		keys: string;
		size?: 'sm' | 'md';
		style?: string | null;
		testid?: string | null;
	} = $props();

	const GLYPHS: Record<string, string> = {
		cmd: '⌘',
		ctrl: '⌃',
		alt: '⌥',
		option: '⌥',
		shift: '⇧',
		enter: '↵',
		return: '↵',
		esc: '⎋',
		escape: '⎋',
		tab: '⇥',
		backspace: '⌫',
		delete: '⌦',
		up: '↑',
		down: '↓',
		left: '←',
		right: '→',
		space: 'Space'
	};

	const caps = $derived(
		keys
			.split('+')
			.map((k) => k.trim().toLowerCase())
			.filter(Boolean)
			.map((k) => GLYPHS[k] ?? k.toUpperCase())
	);
</script>

<div class="kbd {size}" {style} testId={testid}>
	{#each caps as cap, i (i)}
		<div class="cap {size}">{cap}</div>
	{/each}
</div>

<style>
	.kbd { display: flex; flex-direction: row; align-items: center; gap: 4px; }
	.cap {
		display: flex;
		align-items: center;
		justify-content: center;
		border-width: 1px;
		border-bottom-width: 2px;
		border-color: var(--ui-border-strong);
		border-radius: var(--ui-radius-sm);
		background-color: var(--ui-raised);
		color: var(--ui-ink-muted);
		font-weight: 500;
		white-space: nowrap;
		user-select: none;
	}
	.cap.sm { min-width: 18px; height: 18px; padding: 0 4px; font-size: var(--ui-text-xs); }
	.cap.md { min-width: 22px; height: 22px; padding: 0 6px; font-size: var(--ui-text-sm); }
</style>
