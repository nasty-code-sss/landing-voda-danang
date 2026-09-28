import js from '@eslint/js';
import astro from 'eslint-plugin-astro';
import prettier from 'eslint-config-prettier';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import typescript from 'typescript-eslint';
import { noCommentsRule } from './scripts/lint/no-comments-rule.ts';

export default defineConfig(
  globalIgnores(['dist/', '.astro/', 'coverage/', 'playwright-report/', 'test-results/']),
  js.configs.recommended,
  typescript.configs.recommended,
  astro.configs.recommended,
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
  },
  {
    plugins: { project: { rules: { 'no-comments': noCommentsRule } } },
    rules: {
      'project/no-comments': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { ignoreRestSiblings: true }],
    },
  },
  {
    files: ['tests/e2e/**/*.ts', 'tests/smoke/**/*.ts', 'tests/fixtures/**/*.ts'],
    rules: { 'no-empty-pattern': ['error', { allowObjectPatternsAsParameters: true }] },
  },
  prettier,
);
