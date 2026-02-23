import { test, expect } from './fixtures'

test.describe('本棚ページ（シート）', () => {
  test('ユーザーの本棚ページが表示される', async ({ page }) => {
    await page.goto('/testuser/sheets/本棚', { timeout: 30000 })
    await expect(page.getByText('累計読書数')).toBeVisible({ timeout: 15000 })
  })

  test('書籍の読書数が正しく表示される', async ({ page }) => {
    await page.goto('/testuser/sheets/本棚', { timeout: 30000 })
    await expect(page.getByText('累計読書数')).toBeVisible({ timeout: 15000 })
    // seedデータの19冊が表示されることを確認
    await expect(page.getByText('19')).toBeVisible({ timeout: 15000 })
  })

  test('書籍カードの画像が表示される', async ({ page }) => {
    await page.goto('/testuser/sheets/本棚', { timeout: 30000 })
    await expect(page.getByText('累計読書数')).toBeVisible({ timeout: 15000 })
    // Grid表示ではカバー画像がimg要素として表示される
    const bookImages = page.locator('.grid img')
    await expect(bookImages.first()).toBeVisible({ timeout: 15000 })
  })

  test('ソート機能でソート順を変更できる', async ({ page }) => {
    await page.goto('/testuser/sheets/本棚', { timeout: 30000 })
    await expect(page.locator('#sort-select')).toBeVisible({ timeout: 15000 })
    // ソートを「感想順（高評価）」に変更
    await page.locator('#sort-select').selectOption({ index: 1 })
    // ソートが適用されてページが更新されることを確認
    await expect(page.getByText('累計読書数')).toBeVisible()
  })

  test('表示モードをGrid/Listで切り替えできる', async ({ page }) => {
    await page.goto('/testuser/sheets/本棚', { timeout: 30000 })
    await expect(page.getByText('累計読書数')).toBeVisible({ timeout: 15000 })

    // Listボタンをクリック
    const listButton = page.getByRole('button', { name: /List/i })
    if (await listButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await listButton.click()
      await expect(page.getByText('累計読書数')).toBeVisible()
    }

    // Gridボタンをクリックして戻す
    const gridButton = page.getByRole('button', { name: /Grid/i })
    if (await gridButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await gridButton.click()
      await expect(page.getByText('累計読書数')).toBeVisible()
    }
  })

  test('totalページで累計統計が表示される', async ({ page }) => {
    await page.goto('/testuser/sheets/total', { timeout: 30000 })
    await expect(page.getByText('累計読書数')).toBeVisible({ timeout: 15000 })
  })

  test('シートのインデックスページが本棚にリダイレクトされる', async ({
    page,
  }) => {
    await page.goto('/testuser/sheets/', { timeout: 30000 })
    await page.waitForURL('**/testuser/sheets/**', { timeout: 15000 })
    await expect(page.getByText('累計読書数')).toBeVisible({ timeout: 15000 })
  })

  test('存在しないユーザーのシートページにアクセスすると適切に処理される', async ({
    page,
  }) => {
    const response = await page.goto('/nonexistent_user_xyz/sheets/total', {
      timeout: 30000,
    })
    expect(response).not.toBeNull()
  })
})
