// @ts-check
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import tseslint from 'typescript-eslint';

/**
 * フロントエンド・バックエンド共通のESLintベース設定。
 * eslint:recommended + typescript-eslint + prettier を含む。
 *
 * @param {{ typeChecked?: boolean }} [options]
 * @returns {import('typescript-eslint').ConfigArray}
 */
export function createCommonConfig({ typeChecked = false } = {}) {
  return tseslint.config(
    eslint.configs.recommended,
    ...(typeChecked
      ? tseslint.configs.recommendedTypeChecked
      : tseslint.configs.recommended),
    eslintPluginPrettierRecommended,
  );
}
