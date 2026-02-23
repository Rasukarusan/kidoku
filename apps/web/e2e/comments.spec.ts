import { test, expect } from '@playwright/test'

test.describe('コメント一覧ページ', () => {
  test('コメント一覧ページが表示される', async ({ page }) => {
    await page.goto('/comments')
    await expect(
      page.getByRole('heading', { name: 'Comments' })
    ).toBeVisible({ timeout: 15000 })
  })

  test('コメントカードまたはローディング状態が表示される', async ({
    page,
  }) => {
    await page.goto('/comments')
    await expect(
      page.getByRole('heading', { name: 'Comments' })
    ).toBeVisible({ timeout: 15000 })

    // Virtuosoリストまたは読み込み中テキストが表示される
    await expect(
      page
        .locator('[data-testid="virtuoso-scroller"]')
        .or(page.locator('[data-test-id="virtuoso-scroller"]'))
        .or(page.getByText('読み込み中...'))
        .or(page.getByText('すべてのコメントを読み込みました'))
    ).toBeVisible({ timeout: 15000 })
  })

  test('トップページから「さらに表示」でコメント一覧に遷移できる', async ({
    page,
  }) => {
    await page.goto('/')
    const link = page.getByRole('link', { name: 'さらに表示' })
    await expect(link).toBeVisible({ timeout: 15000 })
    const href = await link.getAttribute('href')
    await page.goto(href!)
    await expect(
      page.getByRole('heading', { name: 'Comments' })
    ).toBeVisible({ timeout: 15000 })
  })
})
