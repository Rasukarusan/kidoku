import { test, expect } from '../fixtures'

/**
 * 認証済みユーザーのナビゲーションフローE2Eテスト
 *
 * 主要フロー: ログイン → 各ページ遷移 → 認証状態の維持確認
 */
test.describe('認証済みナビゲーションフロー', () => {
  test('ログイン後に主要ページを順番に遷移できる', async ({
    authedPage: page,
  }) => {
    // ---- Step 1: トップページ ----
    await page.goto('/', { timeout: 30000 })
    await expect(page.getByRole('heading', { name: 'Comments' })).toBeVisible({
      timeout: 15000,
    })

    // ---- Step 2: 本棚ページ ----
    await page.goto('/testuser/sheets/本棚', { timeout: 30000 })
    await expect(page.getByText('累計読書数')).toBeVisible({ timeout: 15000 })

    // 書籍カードが表示されている
    const bookImages = page.locator('.grid img')
    await expect(bookImages.first()).toBeVisible({ timeout: 15000 })

    // ---- Step 3: 累計ページ ----
    await page.goto('/testuser/sheets/total', { timeout: 30000 })
    await expect(page.getByText('累計読書数')).toBeVisible({ timeout: 15000 })

    // ---- Step 4: 設定ページ（認証必要） ----
    await page.goto('/settings/profile', { timeout: 30000 })
    await expect(
      page.getByRole('heading', { name: '設定' })
    ).toBeVisible({ timeout: 15000 })
    // ユーザー名が表示されている
    const section = page.locator('section').filter({ hasText: 'プロフィール' })
    const nameInput = section.locator('input')
    await expect(nameInput).toHaveValue('testuser', { timeout: 10000 })

    // ---- Step 5: コメント一覧ページ ----
    await page.goto('/comments', { timeout: 30000 })
    await expect(
      page.getByRole('heading', { name: 'Comments' })
    ).toBeVisible({ timeout: 15000 })

    // ---- Step 6: Aboutページ ----
    await page.goto('/about', { timeout: 30000 })
    await expect(page.getByText('ようこそkidokuへ！')).toBeVisible({
      timeout: 15000,
    })

    // ---- Step 7: セッションが維持されていることを確認 ----
    const sessionRes = await page.request.get('/api/auth/session')
    const session = await sessionRes.json()
    expect(session.user).toBeDefined()
    expect(session.user.email).toBe('test@example.com')
  })

  test('本棚ページでソート・表示切替が連続して動作する', async ({
    authedPage: page,
  }) => {
    await page.goto('/testuser/sheets/本棚', { timeout: 30000 })
    await expect(page.getByText('累計読書数')).toBeVisible({ timeout: 15000 })

    // ソートセレクトが存在する
    const sortSelect = page.locator('#sort-select')
    await expect(sortSelect).toBeVisible({ timeout: 15000 })

    // ソートを変更
    await sortSelect.selectOption({ index: 1 })
    await expect(page.getByText('累計読書数')).toBeVisible({ timeout: 10000 })

    // 別のソートに変更
    await sortSelect.selectOption({ index: 0 })
    await expect(page.getByText('累計読書数')).toBeVisible({ timeout: 10000 })

    // Grid/List切替
    const listButton = page.getByRole('button', { name: /List/i })
    if (await listButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await listButton.click()
      await expect(page.getByText('累計読書数')).toBeVisible({ timeout: 10000 })

      const gridButton = page.getByRole('button', { name: /Grid/i })
      if (await gridButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await gridButton.click()
        await expect(page.getByText('累計読書数')).toBeVisible({
          timeout: 10000,
        })
      }
    }
  })

  test('書籍詳細ページからパンくずリストで本棚に戻れる', async ({
    authedPage: page,
  }) => {
    // 書籍IDを取得
    const res = await page.request.post('/api/graphql', {
      data: { query: '{ books { id title } }' },
    })
    const json = await res.json()
    const book = json.data.books[0]

    if (book) {
      // 書籍詳細ページへ
      await page.goto(`/books/${book.id}`, {
        timeout: 30000,
        waitUntil: 'domcontentloaded',
      })

      const breadcrumb = page.locator('nav[aria-label="パンくずリスト"]')
      await expect(breadcrumb).toBeVisible({ timeout: 15000 })

      // パンくずリスト内のリンクをクリックして本棚に戻る
      const sheetLink = breadcrumb.getByRole('link').first()
      if (await sheetLink.isVisible({ timeout: 3000 }).catch(() => false)) {
        const href = await sheetLink.getAttribute('href')
        if (href) {
          await page.goto(href, { timeout: 30000 })
          await expect(page.getByText('累計読書数')).toBeVisible({
            timeout: 15000,
          })
        }
      }
    }
  })
})
