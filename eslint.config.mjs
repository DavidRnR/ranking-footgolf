import js from '@eslint/js';
import globals from 'globals';
import json from '@eslint/json';
import css from '@eslint/css';
import { defineConfig, globalIgnores } from 'eslint/config';
import eslintPluginPrettier from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';

export default defineConfig([
  {
    files: ['**/*.{js,mjs,cjs}'],
    plugins: { js, prettier: eslintPluginPrettier },
    extends: ['js/recommended'],
    rules: {
      'arrow-body-style': ['error', 'as-needed'],
      'prettier/prettier': ['error', { endOfLine: 'auto' }],
    },
  },
  {
    files: ['**/*.{js,mjs,cjs}'],
    languageOptions: { globals: globals.browser },
  },
  {
    files: ['**/*.json'],
    plugins: { json },
    language: 'json/json',
    extends: ['json/recommended'],
  },
  {
    files: ['**/*.css'],
    plugins: { css },
    language: 'css/css',
    extends: ['css/recommended'],
  },
  prettierConfig,
  globalIgnores(['package-lock.json']),
]);
