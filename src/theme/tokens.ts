/** Fractalstyler token names. A theme sets values; components read the names. */
export type Tokens = {
	bg: string;
	'bg-surface': string;
	'bg-raised': string;
	'bg-sunken': string;
	'bg-extra': string;
	'text-primary': string;
	'text-secondary': string;
	'text-muted': string;
	'text-theme': string;
	'text-inverse': string;
	border: string;
	'border-strong': string;
	ring: string;
	'theme-color': string;
	'theme-color-alt': string;
	'theme-color-sub': string;
	success: string;
	'success-hover': string;
	'success-soft': string;
	warning: string;
	'warning-hover': string;
	'warning-soft': string;
	danger: string;
	'danger-hover': string;
	'danger-soft': string;
	info: string;
	'info-hover': string;
	'info-soft': string;
	'radius-0': string;
	'radius-sm': string;
	'radius-md': string;
	'radius-bs': string;
	'radius-lg': string;
	'radius-full': string;
	'font-sans': string;
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
	'font-sans': 'Google Sans',
	'font-mono': 'Atkinson Hyperlegible Mono',
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
		'bg-surface': '#ffffff',
		'bg-raised': '#eeeef0',
		'bg-sunken': '#ffffff',
		'bg-extra': '#0f111a66',
		'text-primary': '#1b1d24',
		'text-secondary': '#5d6170',
		'text-muted': '#9a9eab',
		'text-theme': '#ffffff',
		'text-inverse': '#ffffff',
		border: '#e1e2e6',
		'border-strong': '#c4c6cd',
		ring: '#4f6bed',
		'theme-color': '#4f6bed',
		'theme-color-alt': '#3f59d6',
		'theme-color-sub': '#e6eaff',
		success: '#1f9d57',
		'success-hover': '#188248',
		'success-soft': '#ddf4e6',
		warning: '#c77c0e',
		'warning-hover': '#a8680b',
		'warning-soft': '#fbefd8',
		danger: '#d33c3c',
		'danger-hover': '#ba2f2f',
		'danger-soft': '#fbe2e2',
		info: '#3b82f6',
		'info-hover': '#2f6fd9',
		'info-soft': '#e0ecff'
	}
};

export const dark: Theme = {
	name: 'dark',
	dark: true,
	tokens: {
		...shape,
		bg: '#141519',
		'bg-surface': '#1c1d23',
		'bg-raised': '#262830',
		'bg-sunken': '#22242b',
		'bg-extra': '#00000099',
		'text-primary': '#e8e9ee',
		'text-secondary': '#a2a5b3',
		'text-muted': '#6c6f7d',
		'text-theme': '#0e1020',
		'text-inverse': '#ffffff',
		border: '#2e3039',
		'border-strong': '#434654',
		ring: '#7c93ff',
		'theme-color': '#6d84ff',
		'theme-color-alt': '#8396ff',
		'theme-color-sub': '#272e52',
		success: '#3fc07a',
		'success-hover': '#5fd193',
		'success-soft': '#173326',
		warning: '#e6a23c',
		'warning-hover': '#f0b35e',
		'warning-soft': '#3a2c14',
		danger: '#f06464',
		'danger-hover': '#ff7b7b',
		'danger-soft': '#3d1a1c',
		info: '#5b9dff',
		'info-hover': '#7ab2ff',
		'info-soft': '#16294a'
	}
};

export const mandala: Theme = {
	name: 'mandala',
	dark: false,
	tokens: {
		...light.tokens,
		'radius-sm': '2px',
		'radius-md': '4px',
		'radius-lg': '6px',
		bg: '#fbf7ef',
		'bg-surface': '#fffdf8',
		'bg-raised': '#f2ebdd',
		'bg-sunken': '#fffdf8',
		'text-primary': '#2a251f',
		'text-secondary': '#6b6153',
		'text-muted': '#a59a88',
		border: '#e7dcc7',
		'border-strong': '#cdbfa5',
		ring: '#c2571a',
		'theme-color': '#c2571a',
		'theme-color-alt': '#a94912',
		'theme-color-sub': '#f7e2d2'
	}
};

export const midnight: Theme = {
	name: 'midnight',
	dark: true,
	tokens: {
		...dark.tokens,
		'radius-sm': '6px',
		'radius-md': '10px',
		'radius-lg': '16px',
		bg: '#0b0f17',
		'bg-surface': '#111827',
		'bg-raised': '#1a2233',
		'bg-sunken': '#151d2c',
		border: '#1f2a3d',
		'border-strong': '#2f3d57',
		ring: '#2dd4bf',
		'theme-color': '#2dd4bf',
		'theme-color-alt': '#5eead4',
		'theme-color-sub': '#0f3a36',
		'text-theme': '#04201c'
	}
};

export const themes = { light, dark, mandala, midnight };

/** A new theme from a base plus overrides. */
export function create_theme(name: string, base: Theme, overrides: Partial<Tokens>, is_dark = base.dark): Theme {
	return { name, dark: is_dark, tokens: { ...base.tokens, ...overrides } };
}

/** The `set_css_vars` map for a theme, keyed by fractalstyler's token names. */
export function to_vars(tokens: Partial<Tokens>): Record<string, string> {
	const out: Record<string, string> = {};
	for (const [k, v] of Object.entries(tokens)) if (v != null) out[k] = v;
	return out;
}
