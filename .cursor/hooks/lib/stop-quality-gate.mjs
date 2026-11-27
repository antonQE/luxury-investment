// stop: when the agent finishes a turn in which it edited files, run Prettier check, ESLint
// and typecheck for the touched workspaces. On failure, ask the agent to fix via followup_message.
import fs from 'node:fs';
import path from 'node:path';

import {
  clearDirtyFiles,
  localBin,
  readDirtyFiles,
  readStdinJson,
  respond,
  ROOT,
  run,
} from './common.mjs';

const LINTABLE = /\.(ts|tsx|js|jsx|mjs|cjs)$/i;
const OUTPUT_TAIL_LINES = 40;

const WORKSPACE_BY_PREFIX = [
  ['apps/web/', ['@luxury-investment/web']],
  ['apps/admin/', ['@luxury-investment/admin']],
  ['apps/api/', ['@luxury-investment/api']],
  ['apps/e2e/', ['@luxury-investment/e2e']],
  // Shared types feed every app that imports them.
  [
    'packages/shared/',
    [
      '@luxury-investment/shared',
      '@luxury-investment/api',
      '@luxury-investment/web',
      '@luxury-investment/admin',
    ],
  ],
];

function tail(text) {
  const lines = text.trimEnd().split('\n');
  return lines.slice(-OUTPUT_TAIL_LINES).join('\n');
}

const input = await readStdinJson();
if (input.status !== undefined && input.status !== 'completed') {
  respond({});
  process.exit(0);
}

const files = readDirtyFiles().filter((rel) => fs.existsSync(path.join(ROOT, rel)));
if (files.length === 0) {
  clearDirtyFiles();
  respond({});
  process.exit(0);
}

const failures = [];

const prettier = localBin('prettier');
const prettierResult = run(prettier.cmd, [
  ...prettier.prefix,
  '--check',
  '--ignore-unknown',
  '--log-level',
  'warn',
  '--',
  ...files,
]);
if (!prettierResult.ok) {
  failures.push({ label: `prettier --check ${files.join(' ')}`, output: prettierResult.output });
}

const lintFiles = files.filter((rel) => LINTABLE.test(rel));
if (lintFiles.length > 0) {
  const eslint = localBin('eslint');
  const eslintResult = run(eslint.cmd, [
    ...eslint.prefix,
    '--max-warnings',
    '0',
    '--no-warn-ignored',
    '--',
    ...lintFiles,
  ]);
  if (!eslintResult.ok) {
    failures.push({ label: `eslint ${lintFiles.join(' ')}`, output: eslintResult.output });
  }
}

const workspaces = new Set();
for (const rel of files) {
  for (const [prefix, names] of WORKSPACE_BY_PREFIX) {
    if (rel.startsWith(prefix)) names.forEach((name) => workspaces.add(name));
  }
}
for (const workspace of workspaces) {
  const result = run('npm', ['run', 'typecheck', '-w', workspace]);
  if (!result.ok) {
    failures.push({ label: `npm run typecheck -w ${workspace}`, output: result.output });
  }
}

if (failures.length === 0) {
  clearDirtyFiles();
  respond({});
  process.exit(0);
}

const details = failures
  .map((failure) => `$ ${failure.label}\n${tail(failure.output)}`)
  .join('\n\n');

respond({
  followup_message: [
    'The project quality gate failed for files edited in this turn.',
    'Fix the problems below (do not disable rules or skip checks), then finish again.',
    '',
    details,
  ].join('\n'),
});
process.exit(0);
