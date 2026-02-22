import { test, expect } from '@playwright/test'

test.describe('ナビゲーション', () => {
  test('トップページから「さらに表示」リンクでコメント一覧に遷移できる', async ({
    page,
  }) => {
    await page.goto('/')
    await page.getByRole('link', { name: 'さらに表示' }).click()
    await expect(page).toHaveURL('/comments')
  })

  test('特定商取引法ページから利用規約リンクに遷移できる', async ({ page }) => {
    await page.goto('/law')
    await page
      .getByRole('link', { name: '利用規約' })
      .first()
      .click()
    await expect(page).toHaveURL('/terms')
    await expect(
      page.getByRole('heading', { name: 'kidoku利用規約' })
    ).toBeVisible()
  })

  test('特定商取引法ページからプライバシーポリシーリンクに遷移できる', async ({
    page,
  }) => {
    await page.goto('/law')
    await page
      .getByRole('link', { name: 'プライバシーポリシー' })
      .first()
      .click()
    await expect(page).toHaveURL('/privacy')
    await expect(
      page.getByRole('heading', { name: 'プライバシーポリシー' })
    ).toBeVisible()
  })
})
