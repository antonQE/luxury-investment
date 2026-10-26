import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

import { parseEnv } from '../config/env.ts';
import { connectDatabase } from '../infrastructure/db/client.ts';
import { applyWxrImport } from '../modules/migration/wxr-import.ts';
import { mapWxrDocument } from '../modules/migration/wxr-map.ts';
import { parseWxr } from '../modules/migration/wxr-parse.ts';

function argValue(argv: string[], name: string): string | undefined {
  const index = argv.indexOf(name);
  if (index === -1) return undefined;
  return argv[index + 1];
}

function hasFlag(argv: string[], name: string): boolean {
  return argv.includes(name);
}

const argv = process.argv.slice(2);
const dryRun = hasFlag(argv, '--dry-run');
const positional = argv.find((value) => !value.startsWith('-'));
const fileArg = argValue(argv, '--file') ?? positional;
const limitRaw = argValue(argv, '--limit');
const limit = limitRaw === undefined ? undefined : Number(limitRaw);

if (fileArg === undefined) {
  console.error('Usage: import-wxr --file <path-to-wxr.xml> [--dry-run] [--limit N]');
  process.exit(1);
}

if (limitRaw !== undefined && (!Number.isFinite(limit) || (limit ?? 0) < 1)) {
  console.error('--limit must be a positive integer');
  process.exit(1);
}

async function resolveExistingFile(filePath: string): Promise<string> {
  const candidates = [
    path.resolve(filePath),
    path.resolve(process.cwd(), filePath),
    path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..', filePath),
  ];
  for (const candidate of candidates) {
    try {
      await access(candidate);
      return candidate;
    } catch {
      // try next
    }
  }
  throw new Error(`WXR file not found: ${filePath}`);
}

const absolute = await resolveExistingFile(fileArg);
const xml = await readFile(absolute, 'utf8');
const doc = parseWxr(xml);
const report = mapWxrDocument(doc);

console.log(
  JSON.stringify(
    {
      file: absolute,
      dryRun,
      limit: limit ?? null,
      summary: report.summary,
      unmappedTaxonomies: report.unmappedTaxonomies,
      skippedSample: report.skipped.slice(0, 10),
      propertyWarningSample: report.properties
        .flatMap((p) => p.warnings.map((w) => ({ ref: p.referenceNumber, warning: w })))
        .slice(0, 20),
    },
    null,
    2,
  ),
);

if (dryRun) {
  process.exit(0);
}

const env = parseEnv(process.env);
const connection = connectDatabase(env.DATABASE_URL);
try {
  const result = await applyWxrImport(connection.db, report, { limit });
  console.log(JSON.stringify({ applied: result }, null, 2));
} finally {
  await connection.close();
}
