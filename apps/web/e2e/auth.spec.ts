import { test, expect, backdoorLogin } from './fixtures'

test.describe('認証', () => {
  test('裏口ログインでセッションが取得できる', async ({ page }) => {
    await backdoorLogin(page)

    // セッション確認: /api/auth/session がユーザー情報を返す
    const sessionRes = await page.request.get('/api/auth/session')
    const session = await sessionRes.json()
    expect(session.user).toBeDefined()
    expect(session.user.email).toBe('test@example.com')
  })

  test('未認証状態で設定ページにアクセスするとリダイレクトされる', async ({
    page,
  }) => {
    await page.goto('/settings/profile')
    // 未認証時はトップページにリダイレクト
    await expect(page).not.toHaveURL('/settings/profile')
  })

  test('認証済みでGraphQLプロキシにクエリを送信できる', async ({
    authedPage: page,
  }) => {
    const res = await page.request.post('/api/graphql', {
      data: { query: '{ books { id title } }' },
    })
    const json = await res.json()
    expect(json.data).toBeDefined()
    expect(json.data.books).toBeInstanceOf(Array)
  })
})
