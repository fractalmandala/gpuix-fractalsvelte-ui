// Runs every tests/*.test.ts through the gpuix bin, one process each.
import { readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const only = process.argv[2];
const files = readdirSync('tests').filter((f) => f.endsWith('.test.ts') && (!only || f.includes(only)));
const failed: string[] = [];
for (const f of files) {
	const r = spawnSync('npx', ['gpuix-fractalsvelte', `tests/${f}`], { stdio: 'inherit' });
	if (r.status !== 0) failed.push(f);
}
console.log(`\n${files.length - failed.length}/${files.length} suites passed`);
if (failed.length) {
	console.log('failed: ' + failed.join(', '));
	process.exit(1);
}
