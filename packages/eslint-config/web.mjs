// @ts-check
import globals from 'globals';
import tseslint from 'typescript-eslint';
import reactPlugin from 'eslint-plugin-react';
import unusedImportsPlugin from 'eslint-plugin-unused-imports';
import { createCommonConfig } from './common.mjs';

/**
 * フロントエンド（Next.js / React）用のESLint設定を生成する。
 * 共通設定（common）に加え、React・未使用import検出を追加。
 * @returns {import('typescript-eslint').ConfigArray}
 */
export function createWebConfig() {
  return tseslint.config(
    {
      ignores: ['eslint.config.mjs'],
    },
    ...createCommonConfig(),
    {
      languageOptions: {
        globals: {
          ...globals.browser,
          ...globals.es2021,
        },
        sourceType: 'module',
      },
      settings: {
        react: {
          version: 'detect',
        },
      },
    },
    {
      plugins: {
        react: reactPlugin,
        'unused-imports': unusedImportsPlugin,
      },
      rules: {
        'react/react-in-jsx-scope': 'off',
        'react/prop-types': 'off',
        'react/no-unknown-property': 'off',
        '@typescript-eslint/no-unused-vars': [
          'warn',
          { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
        ],
        'unused-imports/no-unused-imports': 'warn',
        '@typescript-eslint/no-empty-function': 'off',
        '@typescript-eslint/no-require-imports': 'off',
        '@typescript-eslint/no-unused-expressions': 'off',
      },
    },
  );
}
