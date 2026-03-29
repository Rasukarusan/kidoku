# GitHub Star Growth Playbook

Kidoku のスター数を伸ばすための、実行可能な改善アイデアをまとめたドキュメントです。

## 目的

スターを増やすには、次の 3 つを同時に改善する必要があります。

1. **発見される**（Discoverability）
2. **一目で価値が伝わる**（Clarity）
3. **触って拡散したくなる**（Shareability）

---

## 1) 発見されるための改善（Discoverability）

### README の SEO を強化する

- 主要キーワード（例: `reading tracker`, `book management`, `nextjs`, `nestjs`, `graphql`, `japanese`）を自然に含める
- `Topics` を GitHub リポジトリ設定で追加する（例: `reading-tracker`, `book-log`, `nextjs`, `nestjs`, `graphql`, `meilisearch`）
- README 冒頭に「何を解決するプロダクトか」を 1 文で明示する

### 外部導線を増やす

- Zenn / Qiita / dev.to で開発記事を公開し、README にリンク
- X（Twitter）で「更新ログ」ポストを定期化（週 1 以上）
- Product Hunt や Hacker News など、ローンチチャネルを明確化

---

## 2) 一目で価値を伝える改善（Clarity）

### 10 秒で理解できる README ファーストビュー

- 現在あるスクリーンショットに加えて、**3〜5 秒の GIF デモ**を追加
- 「誰向けのプロダクトか」を明記
- 「使うとどう嬉しいか」を定量表現で書く（例: 記録時間短縮、継続率向上）

### OSS としての安心感を出す

- CI バッジに加えて `codecov` / `release` バッジを追加
- `CONTRIBUTING.md` の最上部に `good first issue` 導線を配置
- `Roadmap` セクションを README に置き、次のマイルストーンを公開

---

## 3) 拡散される仕組みを作る（Shareability）

### プロダクト内導線（アプリ側）

- SNS 共有ボタン（読了数・月次サマリー）
- OGP を統一デザイン化（「今年読んだ冊数」などを画像化）
- 公開プロフィールページ（任意）を作り、成果をシェア可能にする

### リポジトリ内導線（GitHub 側）

- Issue テンプレートに「成果スクショ」項目を追加
- PR テンプレートに「Before / After」を追加して見どころを可視化
- リリースノートを毎月発行して継続更新を印象づける

---

## 4) 最短で効く実行順（30 日プラン）

### Week 1: README 改善

- ファーストビュー最適化（価値提案 + GIF + キーワード）
- `Roadmap` と `Star` CTA を追加

### Week 2: シェア機能の MVP

- 月次サマリーの画像生成
- X 共有リンク実装

### Week 3: 外部露出

- 技術記事 2 本公開（アーキテクチャ / 実装ハイライト）
- 1 分デモ動画を公開

### Week 4: OSS 成長ループ作成

- `good first issue` を 5 件作る
- 初回コントリビューター向け onboarding issue を固定表示

---

## 5) トラッキング指標（必須）

毎週、次を記録して施策の当たり外れを判断します。

- GitHub stars（週次純増）
- README view → Star の転換率
- Demo サイト訪問数
- 新規 Issue / PR 数
- 初回コントリビューター数

> 目安: 「スター数」よりも先に「README view → Star 転換率」が上がるかを見ると改善効果を判断しやすいです。

---

## 6) Kidoku 向けの具体的な次アクション（おすすめ）

1. README に GIF デモを 1 本追加する
2. 「3 つの代表ユースケース」セクションを追加する
3. `good first issue` を 5 件作って README からリンクする
4. 月次サマリー画像の共有機能を MVP 実装する
5. 2 週間ごとにリリースノートを出す

この 5 つだけでも、短期的にスター獲得効率が改善する可能性が高いです。
