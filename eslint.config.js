import js from '@eslint/js';
import nextPlugin from '@next/eslint-plugin-next';
import { defineConfig, globalIgnores } from 'eslint/config';
import prettierConfig from 'eslint-config-prettier';
import jsxA11y from 'eslint-plugin-jsx-a11y-x';
import reactDom from 'eslint-plugin-react-dom';
import reactHooks from 'eslint-plugin-react-hooks';
import reactX from 'eslint-plugin-react-x';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import unusedImports from 'eslint-plugin-unused-imports';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const FRONTEND_FILES = ['apps/web/**/*.{ts,tsx}', 'apps/admin/**/*.{ts,tsx}'];
const WEB_FILES = ['apps/web/**/*.{ts,tsx}'];

export default defineConfig([
  globalIgnores([
    '**/node_modules/',
    '**/dist/',
    '**/build/',
    '**/coverage/',
    '**/.next/',
    '**/next-env.d.ts',
    'docs/',
    '.cursor/',
  ]),

  js.configs.recommended,
  tseslint.configs.strictTypeChecked,
  tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      'simple-import-sort': simpleImportSort,
      'unused-imports': unusedImports,
    },
    rules: {
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      '@typescript-eslint/no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'error',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],
    },
  },

  {
    files: ['**/*.{js,mjs,cjs}'],
    extends: [tseslint.configs.disableTypeChecked],
    languageOptions: {
      globals: globals.node,
    },
  },

  {
    files: FRONTEND_FILES,
    extends: [
      reactX.configs['recommended-type-checked'],
      reactDom.configs.recommended,
      reactHooks.configs.flat.recommended,
      jsxA11y.configs.recommended,
    ],
    languageOptions: {
      globals: globals.browser,
    },
  },

  {
    files: WEB_FILES,
    extends: [nextPlugin.configs['core-web-vitals']],
    settings: {
      next: { rootDir: 'apps/web/' },
    },
  },

  {
    files: ['**/*.{component.test,test,spec}.{ts,tsx}'],
    rules: {
      '@next/next/no-html-link-for-pages': 'off',
      '@next/next/no-img-element': 'off',
    },
  },

  {
    files: ['apps/e2e/**/*.{ts,tsx}'],
    languageOptions: {
      globals: globals.node,
    },
  },

  prettierConfig,
]);
