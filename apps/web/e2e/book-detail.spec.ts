import { test, expect } from './fixtures'

test.describe('書籍詳細ページ', () => {
  test('本棚ページで書籍画像をクリックするとサイドバーが開く', async ({
    page,
  }) => {
    await page.goto('/testuser/sheets/本棚', { timeout: 30000 })
    await expect(page.getByText('累計読書数')).toBeVisible({ timeout: 15000 })

    // 書籍のカバー画像（drop-shadow-lgクラス付き）が表示されるまで待つ
    const bookImages = page.locator('img.drop-shadow-lg')
    await expect(bookImages.first()).toBeVisible({ timeout: 15000 })

    // React hydrationを待つ（img要素にReactのイベントハンドラが紐づくまで）
    await page.waitForFunction(
      () => {
        const img = document.querySelector('img.drop-shadow-lg')
        if (!img) return false
        return Object.keys(img).some((key) => key.startsWith('__react'))
      },
      { timeout: 30000 }
    )

    // 最初の書籍画像をクリック
    // Playwright click()はマウス移動でhoverオーバーレイの再レンダリングが発生するため
    // dispatchEventで直接クリックイベントを発火させる
    await bookImages.first().dispatchEvent('click')
    // サイドバーが開く（「本の詳細」が表示される）
    await expect(page.getByText('本の詳細')).toBeVisible({ timeout: 10000 })
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
