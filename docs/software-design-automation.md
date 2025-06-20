# Software Design画像取得自動化

このドキュメントでは、Software Design誌の画像を自動的に取得する機能について説明します。

## 概要

Software Design誌（技術評論社）の表紙画像を自動的に取得し、書籍情報として登録できる機能を実装しました。

## 機能

### 1. ISBN検索時の自動判定

Software DesignのISBN（978-4-297で始まる）を検索すると、自動的に技術評論社のサイトから画像を取得します。

```javascript
// 例: ISBN検索でSoftware Designを追加
const result = await searchBookWithMultipleSources('978-4-297-14815-7')
// → 自動的にSoftware Designの画像URLが設定される
```

### 2. APIエンドポイント

#### 最新号を取得
```
GET /api/softwaredesign/latest
```

#### 特定の年月号を取得
```
GET /api/softwaredesign/{year}/{month}
例: /api/softwaredesign/2025/7
```

#### 年間リストを取得
```
GET /api/softwaredesign/year/{year}
例: /api/softwaredesign/year/2025
```

### 3. バッチ処理

管理者権限で最新号を自動的にテンプレートとして登録：

```
POST /api/batch/softwaredesign
Headers: Authorization: Bearer {ADMIN_TOKEN}
```

## 画像URL構造

Software Designの表紙画像は以下の規則的なパターンで提供されています：

```
https://gihyo.jp/assets/images/cover/{年}/thumb/TH800_64{年月下4桁}.jpg
```

例：
- 2025年7月号: `https://gihyo.jp/assets/images/cover/2025/thumb/TH800_642507.jpg`
- 2025年12月号: `https://gihyo.jp/assets/images/cover/2025/thumb/TH800_642512.jpg`

## 使用例

### フロントエンドでの使用

```typescript
// 最新号を取得して登録
const fetchLatestSoftwareDesign = async () => {
  const response = await fetch('/api/softwaredesign/latest')
  const data = await response.json()
  
  if (data.success && data.data) {
    // 書籍として追加
    await addBook(data.data)
  }
}

// 特定の年月号を取得
const fetchSpecificIssue = async (year: number, month: number) => {
  const response = await fetch(`/api/softwaredesign/${year}/${month}`)
  const data = await response.json()
  
  return data.data
}
```

### 定期実行の設定

Vercel Cronやその他のスケジューラーを使用して、毎月自動的に最新号をチェック：

```javascript
// vercel.json
{
  "crons": [{
    "path": "/api/batch/softwaredesign",
    "schedule": "0 0 20 * *"  // 毎月20日に実行
  }]
}
```

## 注意事項

1. **ISBN判定**: 現在は技術評論社のISBNプレフィックス（978-4-297）で判定していますが、より正確な判定のためには実際のSoftware Design固有のISBN範囲を調査する必要があります。

2. **画像の可用性**: 技術評論社のサイト構造が変更された場合、画像URLのパターンも変更される可能性があります。

3. **エラーハンドリング**: 画像が見つからない場合はデフォルト画像（NO_IMAGE）が使用されます。

## 今後の拡張案

1. **ISBNの自動取得**: 技術評論社のサイトから最新号のISBNを自動的に取得
2. **目次情報の取得**: 各号の目次情報も合わせて取得
3. **在庫状況の確認**: 購入可能かどうかの情報も取得
4. **他の技術雑誌への対応**: Web+DB PRESSなど他の技術雑誌にも対応