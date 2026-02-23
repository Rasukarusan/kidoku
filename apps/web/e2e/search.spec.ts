import { test, expect } from '@playwright/test'

test.describe('検索ページ', () => {
  test('クエリなしでアクセスすると検索結果が表示されない', async ({
    page,
  }) => {
    await page.goto('/search')
    // クエリがない場合は検索結果テキストが表示されない
    await expect(page.getByText('の検索結果')).not.toBeVisible()
  })

  test('クエリ付きでアクセスすると検索結果見出しが表示される', async ({
    page,
  }) => {
    await page.goto('/search?q=テスト')
    await expect(page.getByText('「テスト」の検索結果')).toBeVisible({
      timeout: 10000,
    })
  })

  test('存在しないキーワードで検索すると結果が空になる', async ({ page }) => {
    await page.goto('/search?q=zzzzxxxxxnotfound12345')
    await expect(
      page.getByText('「zzzzxxxxxnotfound12345」の検索結果')
    ).toBeVisible({ timeout: 10000 })
    // 結果カードが表示されない（ページネーションなし）
    await expect(page.getByText('次のページへ')).not.toBeVisible()
  })
})
