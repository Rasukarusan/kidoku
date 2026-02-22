import { test, expect } from '@playwright/test'

test.describe('静的ページ', () => {
  test('トップページが表示される', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/kidoku/)
    await expect(page.getByRole('heading', { name: 'Comments' })).toBeVisible()
  })

  test('Aboutページが表示される', async ({ page }) => {
    await page.goto('/about')
    await expect(page.getByText('ようこそkidokuへ！')).toBeVisible()
    await expect(
      page.getByText('あなたの感想を大切に', { exact: true })
    ).toBeVisible()
    await expect(
      page.getByText('思考を整理、共有', { exact: true })
    ).toBeVisible()
    await expect(
      page.getByText('手軽に記録、整理', { exact: true })
    ).toBeVisible()
    await expect(
      page.getByText('コミュニティと繋がる', { exact: true })
    ).toBeVisible()
  })

  test('利用規約ページが表示される', async ({ page }) => {
    await page.goto('/terms')
    await expect(
      page.getByRole('heading', { name: 'kidoku利用規約' })
    ).toBeVisible()
    await expect(
      page.getByRole('heading', { name: '第1条（適用）' })
    ).toBeVisible()
  })

  test('プライバシーポリシーページが表示される', async ({ page }) => {
    await page.goto('/privacy')
    await expect(
      page.getByRole('heading', { name: 'プライバシーポリシー' })
    ).toBeVisible()
    await expect(
      page.getByRole('heading', { name: '1. 個人情報の定義' })
    ).toBeVisible()
  })

  test('特定商取引法ページが表示される', async ({ page }) => {
    await page.goto('/law')
    await expect(
      page.getByRole('heading', { name: '特定商取引法に基づく表記' })
    ).toBeVisible()
    await expect(page.getByText('事業者', { exact: true })).toBeVisible()
  })
})
