import { statSync } from 'node:fs';
import { extname } from 'node:path';
import process from 'node:process';

const MAX_SIZE_BYTES = 1024 * 1024;
const IMAGE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp', '.avif', '.svg']);

const formatBytes = (bytes) => {
  if (bytes < 1024) return `${String(bytes)} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const tooLarge = process.argv
  .slice(2)
  .filter((file) => IMAGE_EXTENSIONS.has(extname(file).toLowerCase()))
  .map((file) => ({ file, size: statSync(file).size }))
  .filter(({ size }) => size > MAX_SIZE_BYTES);

if (tooLarge.length > 0) {
  for (const { file, size } of tooLarge) {
    console.error(`${file} is ${formatBytes(size)}; the limit is ${formatBytes(MAX_SIZE_BYTES)}.`);
  }
  console.error('Optimize these images before committing.');
  process.exit(1);
}
