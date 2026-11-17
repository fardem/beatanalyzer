// Runs the unit tests of the web app (src/**/*.test.ts) with Node's built-in test runner.
// esbuild (already a dev dependency) bundles each test file first, so no extra test framework is needed.
import { build } from 'esbuild';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readdirSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

function findTests(dir) {
  return readdirSync(dir).flatMap((name) => {
    const p = path.join(dir, name);
    if (statSync(p).isDirectory()) return findTests(p);
    return name.endsWith('.test.ts') ? [p] : [];
  });
}

const tests = findTests('src');
const out = mkdtempSync(path.join(tmpdir(), 'beatanalyzer-tests-'));
try {
  const files = [];
  for (const file of tests) {
    const target = path.join(out, path.basename(file).replace(/\.ts$/, '.mjs'));
    await build({ entryPoints: [file], outfile: target, bundle: true, platform: 'node', format: 'esm', logLevel: 'error' });
    files.push(target);
  }
  const run = spawnSync(process.execPath, ['--test', ...files], { stdio: 'inherit' });
  process.exitCode = run.status ?? 1;
} finally {
  rmSync(out, { recursive: true, force: true });
}
