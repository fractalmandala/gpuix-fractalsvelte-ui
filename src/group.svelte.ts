import { getContext, onDestroy, setContext } from 'svelte';

export type Join = 'first' | 'middle' | 'last' | 'only' | null;
type Group = { join: () => () => Join };
const KEY = Symbol('ui-button-group');

/** Called by ButtonGroup: members register in mount order and read back their position. */
export function provide_group() {
	const members: number[] = $state([]);
	let next = 0;
	setContext<Group>(KEY, {
		join() {
			const id = next++;
			members.push(id);
			onDestroy(() => members.splice(members.indexOf(id), 1));
			return () => {
				const i = members.indexOf(id);
				const n = members.length;
				return n === 1 ? 'only' : i === 0 ? 'first' : i === n - 1 ? 'last' : 'middle';
			};
		}
	});
}

/** Called by joinable buttons; outside a ButtonGroup the position is always `null`. */
export function use_join(): () => Join {
	return getContext<Group | undefined>(KEY)?.join() ?? (() => null);
}
