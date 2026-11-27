// afterFileEdit: format the edited file with Prettier and remember it for the stop gate.
// Never blocks the edit; any failure is ignored.
import path from 'node:path';

import { localBin, readDirtyFiles, readStdinJson, ROOT, run, writeDirtyFiles } from './common.mjs';

const FORMATTABLE = /\.(ts|tsx|js|jsx|mjs|cjs|json|css|ya?ml)$/i;
const SKIPPED_DIRS =
  /^(node_modules|\.git|\.next|dist|build|coverage|\.cursor\/hooks\/\.state)(\/|$)/;

const input = await readStdinJson();
const filePath = typeof input.file_path === 'string' ? input.file_path : '';

if (filePath !== '') {
  const rel = path.relative(ROOT, path.resolve(ROOT, filePath)).split(path.sep).join('/');
  const insideRepo = rel !== '' && !rel.startsWith('..') && !path.isAbsolute(rel);

  if (insideRepo && !SKIPPED_DIRS.test(rel) && !rel.includes('/node_modules/')) {
    if (FORMATTABLE.test(rel)) {
      const prettier = localBin('prettier');
      run(prettier.cmd, [
        ...prettier.prefix,
        '--write',
        '--ignore-unknown',
        '--log-level',
        'warn',
        '--',
        rel,
      ]);
    }
    const dirty = readDirtyFiles();
    if (!dirty.includes(rel)) writeDirtyFiles([...dirty, rel]);
  }
}

process.exit(0);
