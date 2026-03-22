# Contributing to Kidoku

Kidoku への貢献に興味を持っていただきありがとうございます！

## Development Setup

[README.md](./README.md) の Getting Started セクションに従って開発環境をセットアップしてください。

## How to Contribute

### Bug Reports / Feature Requests

[GitHub Issues](https://github.com/Rasukarusan/kidoku/issues) から報告・提案してください。

- バグ報告: 再現手順、期待する動作、実際の動作を記載してください
- 機能提案: ユースケースと期待する動作を記載してください

### Pull Requests

1. リポジトリをフォーク
2. 機能ブランチを作成: `git checkout -b feature/amazing-feature`
3. 変更をコミット: `git commit -m 'feat: add amazing feature'`
4. プッシュ: `git push origin feature/amazing-feature`
5. Pull Request を作成

### PR を出す前のチェックリスト

```bash
pnpm validate    # lint + 型チェック + テスト を一括実行
```

このコマンドが通ることを確認してから PR を出してください。

## Coding Guidelines

### コミットメッセージ

[Conventional Commits](https://www.conventionalcommits.org/) に準拠してください。

```
feat: 新機能の説明
fix: バグ修正の説明
docs: ドキュメント変更
chore: ビルド・ツール変更
refactor: リファクタリング
test: テスト追加・修正
```

### コーディング規約

- ファイル名: ケバブケース（例: `create-book.ts`）
- 1ファイル1責務
- テストファイル: `*.spec.ts`（API）、`*.test.ts`（Web）

### アーキテクチャ

バックエンド API は DDD レイヤードアーキテクチャを採用しています。レイヤー間の依存ルールを厳守してください。

- `domain/` は他のレイヤーに依存しない
- `application/` は `domain/` のみに依存
- `infrastructure/` は `domain/` に依存（リポジトリ実装）
- `presentation/` は `application/` と `domain/` に依存

詳細は [CLAUDE.md](./CLAUDE.md) を参照してください。

## Questions?

不明点があれば [GitHub Issues](https://github.com/Rasukarusan/kidoku/issues) で質問してください。
