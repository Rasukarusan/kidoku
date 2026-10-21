import { test, expect } from './fixtures'

test.describe('コレクションと旧シートURLの互換性', () => {
  test('旧シートURLからID付きコレクションへ遷移する', async ({ page }) => {
    await page.goto('/testuser/sheets/本棚')
    await expect(page).toHaveURL(/\/testuser\/collections\/\d+/)
    await expect(
      page.getByRole('heading', { name: '本棚', exact: true })
    ).toBeVisible()
  })
  test('アイテム数と履歴数を分けて表示する', async ({ page }) => {
    await page.goto('/testuser/collections')
    await expect(page.getByText('アイテム', { exact: true })).toBeVisible()
    await expect(page.getByText(/\d+件/).first()).toBeVisible()
    await expect(page.getByText('履歴', { exact: true }).first()).toBeVisible()
  })
  test('アイテム画像とタイトルを表示する', async ({ page }) => {
    await page.goto('/testuser/collections')
    await expect(page.locator('a[href^="/items/"] img').first()).toBeVisible()
    await expect(
      page.getByText('吾輩は猫である', { exact: true })
    ).toBeVisible()
  })
  test('本だけに絞り込める', async ({ page }) => {
    await page.goto('/testuser/collections')
    await page.getByLabel('種類で絞り込み').selectOption('book')
    await expect(page.getByText(/\d+冊/).first()).toBeVisible()
  })
  test('タイトルでアイテムを検索できる', async ({ page }) => {
    await page.goto('/testuser/collections')
    await page.getByRole('searchbox', { name: 'タイトル検索' }).fill('吾輩は猫')
    await expect(
      page.getByText('吾輩は猫である', { exact: true })
    ).toBeVisible()
    await expect(page.getByText('人間失格', { exact: true })).not.toBeVisible()
  })
  test('旧累計ページが全アイテムへ遷移する', async ({ page }) => {
    await page.goto('/testuser/sheets/total')
    await expect(page).toHaveURL(/\/testuser\/collections$/)
    await expect(
      page.getByRole('heading', { name: 'すべてのアイテム' })
    ).toBeVisible()
  })
  test('旧シート一覧もコレクション一覧へ遷移する', async ({ page }) => {
    await page.goto('/testuser/sheets/')
    await expect(page).toHaveURL(/\/testuser\/collections\/?$/)
    await expect(
      page.getByRole('heading', { name: 'すべてのアイテム' })
    ).toBeVisible()
  })
  test('存在しないユーザーは404になる', async ({ page }) => {
    const response = await page.goto('/nonexistent_user_xyz/collections')
    expect(response?.status()).toBe(404)
  })
})
