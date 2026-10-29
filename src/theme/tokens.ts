/** The token contract: every component reads only these keys, as `var(--ui-<key>)`. */
export type Tokens = {
	bg: string;
	surface: string;
	raised: string;
	overlay: string;
	scrim: string;
	ink: string;
	'ink-muted': string;
	'ink-faint': string;
	border: string;
	'border-strong': string;
	ring: string;
	accent: string;
	'accent-hover': string;
	'accent-ink': string;
	'accent-soft': string;
	success: string;
	'success-ink': string;
	'success-soft': string;
	warn: string;
	'warn-ink': string;
	'warn-soft': string;
	danger: string;
	'danger-hover': string;
	'danger-ink': string;
	'danger-soft': string;
	'radius-0': string;
	'radius-sm': string;
	'radius-md': string;
	'radius-bs': string;
	'radius-lg': string;
	'radius-full': string;
	font: string;
	'font-mono': string;
	'text-xs': string;
	'text-sm': string;
	'text-md': string;
	'text-lg': string;
	'text-xl': string;
	'text-2xl': string;
};

export type Theme = { name: string; dark: boolean; tokens: Tokens };

const shape = {
	'radius-0': '0px',
	'radius-sm': '4px',
	'radius-md': '6px',
	'radius-bs': '8px',
	'radius-lg': '11px',
	'radius-full': '9999px',
	font: 'Inter',
	'font-mono': 'Menlo',
	'text-xs': '11px',
	'text-sm': '12px',
	'text-md': '14px',
	'text-lg': '16px',
	'text-xl': '20px',
	'text-2xl': '26px'
} as const;

export const light: Theme = {
	name: 'light',
	dark: false,
	tokens: {
		...shape,
		bg: '#f6f6f7',
		surface: '#ffffff',
		raised: '#eeeef0',
		overlay: '#ffffff',
		scrim: '#0f111a66',
		ink: '#1b1d24',
		'ink-muted': '#5d6170',
		'ink-faint': '#9a9eab',
		border: '#e1e2e6',
		'border-strong': '#c4c6cd',
		ring: '#4f6bed',
		accent: '#4f6bed',
		'accent-hover': '#3f59d6',
		'accent-ink': '#ffffff',
		'accent-soft': '#e6eaff',
		success: '#1f9d57',
		'success-ink': '#ffffff',
		'success-soft': '#ddf4e6',
		warn: '#c77c0e',
		'warn-ink': '#ffffff',
		'warn-soft': '#fbefd8',
		danger: '#d33c3c',
		'danger-hover': '#ba2f2f',
		'danger-ink': '#ffffff',
		'danger-soft': '#fbe2e2'
	}
};

export const dark: Theme = {
	name: 'dark',
	dark: true,
	tokens: {
		...shape,
		bg: '#141519',
		surface: '#1c1d23',
		raised: '#262830',
		overlay: '#22242b',
		scrim: '#00000099',
		ink: '#e8e9ee',
		'ink-muted': '#a2a5b3',
		'ink-faint': '#6c6f7d',
		border: '#2e3039',
		'border-strong': '#434654',
		ring: '#7c93ff',
		accent: '#6d84ff',
		'accent-hover': '#8396ff',
		'accent-ink': '#0e1020',
		'accent-soft': '#272e52',
		success: '#3fc07a',
		'success-ink': '#0b1a12',
		'success-soft': '#173326',
		warn: '#e6a23c',
		'warn-ink': '#1d1405',
		'warn-soft': '#3a2c14',
		danger: '#f06464',
		'danger-hover': '#ff7b7b',
		'danger-ink': '#1e0909',
		'danger-soft': '#3d1a1c'
	}
};

export const mandala: Theme = {
	name: 'mandala',
	dark: false,
	tokens: {
		...light.tokens,
		bg: '#fbf7ef',
		surface: '#fffdf8',
		raised: '#f2ebdd',
		overlay: '#fffdf8',
		ink: '#2a251f',
		'ink-muted': '#6b6153',
		'ink-faint': '#a59a88',
		border: '#e7dcc7',
		'border-strong': '#cdbfa5',
		ring: '#c2571a',
		accent: '#c2571a',
		'accent-hover': '#a94912',
		'accent-soft': '#f7e2d2',
		'radius-0': '0px',
		'radius-sm': '4px',
		'radius-bs': '8px',
		'radius-lg': '11px',
		'radius-full': '9999px'
	}
};

export const midnight: Theme = {
	name: 'midnight',
	dark: true,
	tokens: {
		...dark.tokens,
		bg: '#0b0f17',
		surface: '#111827',
		raised: '#1a2233',
		overlay: '#151d2c',
		border: '#1f2a3d',
		'border-strong': '#2f3d57',
		ring: '#2dd4bf',
		accent: '#2dd4bf',
		'accent-hover': '#5eead4',
		'accent-ink': '#04201c',
		'accent-soft': '#0f3a36',
		'radius-0': '0px',
		'radius-sm': '4px',
		'radius-bs': '8px',
		'radius-lg': '11px',
		'radius-full': '9999px'
	}
};

export const themes = { light, dark, mandala, midnight };

/** A new theme from a base plus overrides. */
export function create_theme(name: string, base: Theme, overrides: Partial<Tokens>, is_dark = base.dark): Theme {
	return { name, dark: is_dark, tokens: { ...base.tokens, ...overrides } };
}

/** The `set_css_vars` map for a theme: `{ 'ui-accent': '#…' }`. */
export function to_vars(tokens: Partial<Tokens>): Record<string, string> {
	const out: Record<string, string> = {};
	for (const [k, v] of Object.entries(tokens)) if (v != null) out[`ui-${k}`] = v;
	return out;
}
