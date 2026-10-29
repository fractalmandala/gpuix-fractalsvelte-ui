<script lang="ts">
	let {
		keys = '',
		size = 'h-md',
		style = null,
		testid = null
	}: {
		/** A chord such as `cmd+k` or `shift+enter`; each part becomes one cap. */
		keys: string;
		/** Fractalstyler's height steps. */
		size?: 'h-sm' | 'h-md';
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
		<div class="cap el-size {size}">{cap}</div>
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
		border-color: var(--border-strong);
		border-radius: var(--radius-sm);
		background-color: var(--bg-raised);
		color: var(--text-secondary);
		font-weight: 500;
		white-space: nowrap;
		user-select: none;
	}
	.cap { min-width: var(--height-md); padding: 0 6px; }
</style>
