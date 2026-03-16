import { test, expect, backdoorLogin } from '../fixtures'

/**
 * ログインフローE2Eテスト
 *
 * 裏口ログインによる認証フロー全体をテスト
 * セッション取得 → 認証付きページアクセス → GraphQLクエリ → ログアウト
 */
test.describe('ログインフロー', () => {
  test('裏口ログイン → セッション確認 → 認証付きページアクセス → GraphQLクエリ', async ({
    page,
  }) => {
    // ---- Step 1: ログイン前はセッションがない ----
    const preSessionRes = await page.request.get('/api/auth/session')
    const preSession = await preSessionRes.json()
    expect(preSession.user).toBeUndefined()

    // ---- Step 2: 裏口ログイン ----
    await backdoorLogin(page)

    // ---- Step 3: セッション確認 ----
    const sessionRes = await page.request.get('/api/auth/session')
    const session = await sessionRes.json()
    expect(session.user).toBeDefined()
    expect(session.user.email).toBe('test@example.com')
    expect(session.user.name).toBe('testuser')

    // ---- Step 4: 認証が必要なページにアクセスできる ----
    await page.goto('/settings/profile', { timeout: 30000 })
    await expect(
      page.getByRole('heading', { name: '設定' })
    ).toBeVisible({ timeout: 15000 })

    // ---- Step 5: GraphQLクエリが成功する ----
    const booksRes = await page.request.post('/api/graphql', {
      data: { query: '{ books { id title } }' },
    })
    const booksJson = await booksRes.json()
    expect(booksJson.data).toBeDefined()
    expect(booksJson.data.books).toBeInstanceOf(Array)
    expect(booksJson.data.books.length).toBeGreaterThan(0)

    // ---- Step 6: シートクエリも成功する ----
    const sheetsRes = await page.request.post('/api/graphql', {
      data: { query: '{ sheets { id name } }' },
    })
    const sheetsJson = await sheetsRes.json()
    expect(sheetsJson.data.sheets).toBeInstanceOf(Array)
    expect(sheetsJson.data.sheets.length).toBeGreaterThan(0)
  })

  test('未認証状態での制限確認', async ({ page }) => {
    // ---- Step 1: 未認証でGraphQLクエリを送信 ----
    const booksRes = await page.request.post('/api/graphql', {
      data: { query: '{ books { id title } }' },
    })
    // プロキシはセッションなしでもリクエストを転送するが、署名が無効になる
    // レスポンスはエラーまたは空配列のいずれか
    const booksJson = await booksRes.json()
    // エラーがあるか、データが空であることを確認
    const hasError = booksJson.errors !== undefined
    const hasEmptyData =
      booksJson.data?.books === undefined || booksJson.data?.books === null
    expect(hasError || hasEmptyData).toBe(true)

    // ---- Step 2: 設定ページにアクセスするとリダイレクトされる ----
    await page.goto('/settings/profile', { timeout: 30000 })
    await expect(page).not.toHaveURL('/settings/profile')

    // ---- Step 3: 書籍APIにアクセスすると401が返る ----
    const apiRes = await page.request.fetch('/api/books', {
      method: 'POST',
      headers: { Accept: 'application/json' },
      data: JSON.stringify({ title: 'test' }),
    })
    expect(apiRes.status()).toBe(401)
  })

  test('認証状態が複数リクエスト間で維持される', async ({
    authedPage: page,
  }) => {
    // 連続してAPIリクエストを送信し、すべて成功することを確認
    const requests = [
      page.request.post('/api/graphql', {
        data: { query: '{ books { id } }' },
      }),
      page.request.post('/api/graphql', {
        data: { query: '{ sheets { id } }' },
      }),
      page.request.post('/api/graphql', {
        data: { query: '{ bookCategories }' },
      }),
    ]
    const responses = await Promise.all(requests)
    for (const res of responses) {
      const json = await res.json()
      expect(json.data).toBeDefined()
    }
  })
})
