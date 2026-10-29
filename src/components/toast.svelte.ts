export type ToastVariant = 'secondary' | 'themed' | 'info' | 'success' | 'warning' | 'danger';

export type ToastItem = { id: number; message: string; title: string; variant: ToastVariant };

export const toasts = $state<ToastItem[]>([]);

const timers = new Map<number, ReturnType<typeof setTimeout>>();
let next = 1;

/** Shows a toast and returns its id. `duration` is in ms; `0` keeps it until dismissed. */
export function toast(
	message: string,
	{ title = '', variant = 'secondary', duration = 4000 }: { title?: string; variant?: ToastVariant; duration?: number } = {}
): number {
	const id = next++;
	toasts.push({ id, message, title, variant });
	if (duration > 0) timers.set(id, setTimeout(() => dismiss(id), duration));
	return id;
}

export function dismiss(id: number) {
	clearTimeout(timers.get(id));
	timers.delete(id);
	const i = toasts.findIndex((t) => t.id === id);
	if (i >= 0) toasts.splice(i, 1);
}
