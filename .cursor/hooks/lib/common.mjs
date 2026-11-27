import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

export const ROOT = process.cwd();
export const STATE_DIR = path.join(ROOT, '.cursor/hooks/.state');
export const DIRTY_FILE = path.join(STATE_DIR, 'dirty-files');

export async function readStdinJson() {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString('utf8').trim();
  if (raw === '') return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function respond(payload) {
  process.stdout.write(JSON.stringify(payload));
}

export function readDirtyFiles() {
  if (!fs.existsSync(DIRTY_FILE)) return [];
  return [
    ...new Set(
      fs
        .readFileSync(DIRTY_FILE, 'utf8')
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line !== ''),
    ),
  ];
}

export function writeDirtyFiles(files) {
  fs.mkdirSync(STATE_DIR, { recursive: true });
  fs.writeFileSync(DIRTY_FILE, files.length === 0 ? '' : `${files.join('\n')}\n`);
}

export function clearDirtyFiles() {
  fs.rmSync(DIRTY_FILE, { force: true });
}

/** Prefer the repo-local binary; fall back to npx. */
export function localBin(name) {
  const bin = path.join(ROOT, 'node_modules/.bin', name);
  return fs.existsSync(bin) ? { cmd: bin, prefix: [] } : { cmd: 'npx', prefix: ['--no', name] };
}

export function run(cmd, args) {
  const result = spawnSync(cmd, args, {
    cwd: ROOT,
    encoding: 'utf8',
    maxBuffer: 32 * 1024 * 1024,
    env: { ...process.env, FORCE_COLOR: '0', NO_COLOR: '1' },
  });
  return {
    ok: result.status === 0,
    output: `${result.stdout ?? ''}${result.stderr ?? ''}${result.error ? String(result.error) : ''}`,
  };
}
