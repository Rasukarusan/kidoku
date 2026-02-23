import { test as base, expect, type Page } from '@playwright/test'

/**
 * 裏口ログインでセッションを取得するヘルパー
 * NEXT_PUBLIC_ENABLE_BACKDOOR_LOGIN=true が前提
 */
async function backdoorLogin(page: Page, email = 'test@example.com') {
  const csrfRes = await page.request.get('/api/auth/csrf')
  const { csrfToken } = await csrfRes.json()

  await page.request.post('/api/auth/callback/backdoor', {
    form: { csrfToken, email },
    maxRedirects: 0,
  })
}

/** 認証済みページを提供するフィクスチャ */
export const test = base.extend<{ authedPage: Page }>({
  authedPage: async ({ page }, use) => {
    await backdoorLogin(page)
    await use(page)
  },
})

export { expect, backdoorLogin }
