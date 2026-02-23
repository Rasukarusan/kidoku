// @ts-check
import path from 'path';
import { fileURLToPath } from 'url';
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.resolve(__dirname, 'src');

/**
 * ファイルパスからDDDレイヤー名を返す。
 * presentation/modules は NestJSのDI合成ルートとして infrastructure への依存を許容するため
 * presentation と分けて管理する。
 * @param {string} filePath - ファイルの絶対パス
 * @returns {string|null} レイヤー名（src配下でない場合は null）
 */
function getLayer(filePath) {
  const relative = path.relative(srcDir, filePath).replace(/\\/g, '/');
  if (relative.startsWith('..')) return null; // src配下でない

  if (relative.startsWith('domain/')) return 'domain';
  if (relative.startsWith('application/')) return 'application';
  // infrastructure/auth は認証デコレーター・ガードを提供するため
  // presentation/resolvers からの利用を許容する
  if (relative.startsWith('infrastructure/auth/')) return 'infrastructure-auth';
  if (relative.startsWith('infrastructure/')) return 'infrastructure';
  // presentation/modules は NestJS DI の合成ルート。infrastructure 全体に依存できる
  if (relative.startsWith('presentation/modules/')) return 'presentation-modules';
  if (relative.startsWith('presentation/')) return 'presentation';
  if (relative.startsWith('shared/')) return 'shared';
  return null;
}

/**
 * レイヤーごとの禁止インポート定義。
 * ここに列挙されたレイヤー "から" の import にのみルールが適用される。
 * 定義のないレイヤー（presentation-modules, shared 等）は無制限。
 */
const LAYER_VIOLATIONS = {
  domain: {
    forbidden: [
      'application',
      'infrastructure-auth',
      'infrastructure',
      'presentation-modules',
      'presentation',
    ],
    hint: 'domain層は他のいかなる層にも依存してはいけません',
  },
  application: {
    forbidden: [
      'infrastructure-auth',
      'infrastructure',
      'presentation-modules',
      'presentation',
    ],
    hint: 'application層はdomain層・shared層のみに依存できます。インフラ実装への依存はリポジトリインターフェース経由（DI）で解決してください',
  },
  presentation: {
    // resolvers/dto は infrastructure/repositories や infrastructure/database を
    // 直接使ってはいけない（ユースケース経由）。
    // ただし infrastructure/auth（ガード・デコレーター）は使用可。
    forbidden: ['infrastructure'],
    hint: 'presentation/resolvers・dto は infrastructure/repositories 等を直接importできません。ユースケース経由でアクセスしてください',
  },
};

/** @type {import('eslint').Rule.RuleModule} */
const dddLayerBoundariesRule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'DDDレイヤー境界を強制する（domain/application/presentation 層が許可されていない層をimportすることを禁止）',
    },
    messages: {
      layerViolation:
        '[DDD層違反] {{ fromLayer }} → {{ toLayer }} のimportは禁止されています。{{ hint }}',
    },
    schema: [],
  },
  create(context) {
    return {
      ImportDeclaration(node) {
        const importSource = /** @type {string} */ (node.source.value);
        // 相対パスのみ対象（外部パッケージは対象外）
        if (!importSource.startsWith('.')) return;

        const currentFile = context.getFilename();
        const fromLayer = getLayer(currentFile);
        if (!fromLayer || !LAYER_VIOLATIONS[fromLayer]) return;

        const importedPath = path.resolve(
          path.dirname(currentFile),
          importSource,
        );
        const toLayer = getLayer(importedPath);
        if (!toLayer) return;

        const rule = LAYER_VIOLATIONS[fromLayer];
        if (rule.forbidden.includes(toLayer)) {
          context.report({
            node,
            messageId: 'layerViolation',
            data: {
              fromLayer,
              toLayer,
              hint: rule.hint,
            },
          });
        }
      },
    };
  },
};

/** インラインプラグインとして定義（外部パッケージ不要） */
const dddBoundariesPlugin = {
  rules: {
    'layer-boundaries': dddLayerBoundariesRule,
  },
};

export default tseslint.config(
  {
    ignores: ['eslint.config.mjs'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'commonjs',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    plugins: {
      'ddd-boundaries': dddBoundariesPlugin,
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      '@typescript-eslint/no-unsafe-member-access': 'off', // NestJSのDIを解決できないぽい。@see https://github.com/typescript-eslint/typescript-eslint/issues/9591
      '@typescript-eslint/no-unsafe-call': 'off', // 上記同様
      '@typescript-eslint/no-unsafe-return': 'off', // 上記同様
      'ddd-boundaries/layer-boundaries': 'error',
    },
  },
  {
    files: ['**/*.spec.ts', '**/*.e2e-spec.ts'],
    rules: {
      '@typescript-eslint/unbound-method': 'off', // jest.Mocked のアサーションで誤検知するため
    },
  },
);
