export default {
  '*.{ts,tsx,js,mjs,cjs}': ['eslint --fix --max-warnings 0', 'prettier --write --ignore-unknown'],
  '*.{json,css,yml,yaml}': 'prettier --write --ignore-unknown',
  '*.{png,jpg,jpeg,gif,webp,avif,svg}': 'node scripts/check-image-size.js',
};
