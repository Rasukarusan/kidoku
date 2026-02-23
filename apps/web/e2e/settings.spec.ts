import { test, expect } from './fixtures'

test.describe('設定ページ', () => {
  test('認証済みで設定ページにアクセスできる', async ({ authedPage: page }) => {
    await page.goto('/settings/profile', { timeout: 30000 })
    await expect(
      page.getByRole('heading', { name: '設定' })
    ).toBeVisible({ timeout: 15000 })
  })

  test('プロフィールセクションが表示される', async ({ authedPage: page }) => {
    await page.goto('/settings/profile', { timeout: 30000 })
    await expect(page.getByText('プロフィール')).toBeVisible({
      timeout: 15000,
    })
    await expect(page.getByText('表示名')).toBeVisible()
  })

  test('データエクスポートセクションが表示される', async ({
    authedPage: page,
  }) => {
    await page.goto('/settings/profile', { timeout: 30000 })
    await expect(page.getByText('データエクスポート')).toBeVisible({
      timeout: 15000,
    })
    await expect(
      page.getByText('すべての読書記録をCSV形式でダウンロードできます。')
    ).toBeVisible()
    await expect(
      page.getByRole('button', { name: 'CSVでダウンロード' })
    ).toBeVisible()
  })

  test('アカウント削除セクションが表示される', async ({
    authedPage: page,
  }) => {
    await page.goto('/settings/profile', { timeout: 30000 })
    await expect(page.getByText('アカウント削除')).toBeVisible({
      timeout: 15000,
    })
    await expect(
      page.getByText(
        'アカウントを削除すると登録されていたデータは全て削除され、復元できません。'
      )
    ).toBeVisible()
    await expect(
      page.getByRole('button', { name: 'アカウントを削除する' })
    ).toBeVisible()
  })

  test('表示名の入力フィールドに現在のユーザー名が表示される', async ({
    authedPage: page,
  }) => {
    await page.goto('/settings/profile', { timeout: 30000 })
    await expect(page.getByText('表示名')).toBeVisible({ timeout: 15000 })
    // プロフィールセクション内の入力フィールドに「testuser」が入っているはず
    const section = page.locator('section').filter({ hasText: 'プロフィール' })
    const nameInput = section.locator('input')
    await expect(nameInput).toHaveValue('testuser', { timeout: 10000 })
  })
})
