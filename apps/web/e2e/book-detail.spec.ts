import { test, expect } from './fixtures'

test.describe('書籍詳細ページ', () => {
  test('アイテムの画像から詳細ページへ遷移できる', async ({ page }) => {
    await page.goto('/testuser/collections')
    const link = page.locator('a[href^="/items/"]').first()
    const href = await link.getAttribute('href')
    await link.click()
    await expect(page).toHaveURL(href!)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  })

  test('パンくずリストが表示される（/books/[id]ページ）', async ({
    authedPage: page,
  }) => {
    // GraphQLで書籍一覧を取得してIDを特定
    const res = await page.request.post('/api/graphql', {
      data: { query: '{ books { id title } }' },
    })
    const json = await res.json()
    const book = json.data.books.find(
      (b: { title: string }) => b.title === 'トレーダーの精神分析'
    )

    if (book) {
      await page.goto(`/books/${book.id}`, {
        timeout: 30000,
        waitUntil: 'domcontentloaded',
      })
      // パンくずリスト
      const breadcrumb = page.locator('nav[aria-label="パンくずリスト"]')
      await expect(breadcrumb).toBeVisible({ timeout: 15000 })
      // 書籍タイトルがh1見出しとして表示される
      await expect(
        page.getByRole('heading', { name: 'トレーダーの精神分析' })
      ).toBeVisible()
    }
  })

  test('存在しない書籍IDでアクセスすると404が返る', async ({ page }) => {
    const response = await page.goto('/books/99999999', { timeout: 30000 })
    // Next.jsのfallback: 'blocking'で存在しない場合、404ステータスを返す
    expect(response?.status()).toBe(404)
  })
})
