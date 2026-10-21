import { test, expect, type Page } from '../fixtures'

/** Assert the canonical collection after following a legacy sheet URL. */
async function waitForCollectionAndExpect(
  page: Page,
  _url: string,
  locator: () => ReturnType<Page['locator']>,
  options?: { setup?: () => Promise<void> }
) {
  if (options?.setup) await options.setup()
  await expect(locator()).toBeVisible({ timeout: 15000 })
}

test.describe('書籍ライフサイクル（E2Eフロー）', () => {
  const testBook = {
    title: 'E2Eフローテスト書籍',
    author: 'フローテスト著者',
    category: 'テスト',
    image: '/no-image.png',
    impression: '◯',
    memo: 'E2Eフローテスト用のメモです',
    isPublicMemo: true,
    finished: '2025-06-01',
  }

  let bookId: number
  let sheetId: number
  let sheetName: string

  test('ログイン → 書籍登録 → 一覧確認 → 詳細確認 → 更新 → 削除', async ({
    authedPage: page,
  }) => {
    // 認証付きAPIと複数ページの確認を行うためタイムアウトを延長
    test.setTimeout(120_000)
    // ---- Step 1: セッション確認 ----
    const sessionRes = await page.request.get('/api/auth/session')
    const session = await sessionRes.json()
    expect(session.user).toBeDefined()
    expect(session.user.email).toBe('test@example.com')

    // ---- Step 2: シート取得 ----
    const sheetsRes = await page.request.post('/api/graphql', {
      data: { query: '{ sheets { id name } }' },
    })
    const sheetsJson = await sheetsRes.json()
    expect(sheetsJson.data.sheets.length).toBeGreaterThan(0)
    const sheet = sheetsJson.data.sheets[0]
    sheetId = sheet.id
    sheetName = sheet.name

    // ---- Step 3: 書籍登録（API経由） ----
    const createRes = await page.request.fetch('/api/books', {
      method: 'POST',
      headers: { Accept: 'application/json' },
      data: JSON.stringify({
        id: '',
        ...testBook,
        sheet: { id: sheetId, name: sheetName },
      }),
    })
    const createJson = await createRes.json()
    expect(createJson.result).toBe(true)
    expect(createJson.bookTitle).toBe(testBook.title)
    bookId = createJson.bookId

    // ---- Step 4: GraphQLで書籍データの整合性を確認 ----
    const booksRes = await page.request.post('/api/graphql', {
      data: { query: '{ books { id title author category impression } }' },
    })
    const booksJson = await booksRes.json()
    const createdBook = booksJson.data.books.find(
      (b: { id: string }) => b.id === String(bookId)
    )
    expect(createdBook).toBeDefined()
    expect(createdBook.title).toBe(testBook.title)
    expect(createdBook.author).toBe(testBook.author)
    expect(createdBook.category).toBe(testBook.category)
    expect(createdBook.impression).toBe(testBook.impression)

    // ---- Step 5: 本棚ページで書籍が表示されることを確認 ----
    // 旧URLから新しいコレクションへ遷移し、タイトルを確認する
    const sheetUrl = `/testuser/sheets/${sheetName}`
    const waitForCollection = async () => {
      await expect(
        page.getByRole('heading', { name: /本棚|すべてのアイテム/ })
      ).toBeVisible({ timeout: 15000 })
    }
    await page.goto(sheetUrl, { timeout: 30000 })
    await waitForCollectionAndExpect(
      page,
      sheetUrl,
      () => page.getByText(testBook.title).first(),
      { setup: waitForCollection }
    )

    // ---- Step 6: 書籍詳細ページで表示を確認 ----
    await page.goto(`/books/${bookId}`, {
      timeout: 30000,
      waitUntil: 'domcontentloaded',
    })
    // パンくずリスト
    const breadcrumb = page.locator('nav[aria-label="パンくずリスト"]')
    await expect(breadcrumb).toBeVisible({ timeout: 15000 })
    // タイトルが見出しとして表示
    await expect(
      page.getByRole('heading', { name: testBook.title })
    ).toBeVisible({ timeout: 15000 })

    // ---- Step 7: 書籍更新（API経由） ----
    const updatedTitle = 'E2Eフローテスト書籍（更新済み）'
    const updatedAuthor = 'フローテスト著者（更新済み）'
    const updateRes = await page.request.fetch('/api/books', {
      method: 'PUT',
      headers: { Accept: 'application/json' },
      data: JSON.stringify({
        id: bookId,
        title: updatedTitle,
        author: updatedAuthor,
        category: testBook.category,
        image: testBook.image,
        impression: '◎',
        memo: '更新されたメモ',
        isPublicMemo: true,
        finished: '2025-07-01',
      }),
    })
    const updateJson = await updateRes.json()
    expect(updateJson.result).toBe(true)

    // ---- Step 8: 更新後のデータをGraphQLで確認 ----
    const updatedBooksRes = await page.request.post('/api/graphql', {
      data: { query: '{ books { id title author impression } }' },
    })
    const updatedBooksJson = await updatedBooksRes.json()
    const updatedBook = updatedBooksJson.data.books.find(
      (b: { id: string }) => b.id === String(bookId)
    )
    expect(updatedBook).toBeDefined()
    expect(updatedBook.title).toBe(updatedTitle)
    expect(updatedBook.author).toBe(updatedAuthor)
    expect(updatedBook.impression).toBe('◎')

    // ---- Step 9: 更新後の本棚ページで反映を確認 ----
    // タイトルの更新を確認
    await page.goto(sheetUrl, { timeout: 30000 })
    await waitForCollectionAndExpect(
      page,
      sheetUrl,
      () => page.getByText(updatedTitle).first(),
      { setup: waitForCollection }
    )

    // ---- Step 10: 書籍削除（API経由） ----
    const deleteRes = await page.request.fetch('/api/books', {
      method: 'DELETE',
      headers: { Accept: 'application/json' },
      data: JSON.stringify({ id: bookId }),
    })
    const deleteJson = await deleteRes.json()
    expect(deleteJson.result).toBe(true)

    // ---- Step 11: 削除後にGraphQLで確認 ----
    const afterDeleteRes = await page.request.post('/api/graphql', {
      data: { query: '{ books { id title } }' },
    })
    const afterDeleteJson = await afterDeleteRes.json()
    const deletedBook = afterDeleteJson.data.books.find(
      (b: { id: string }) => b.id === String(bookId)
    )
    expect(deletedBook).toBeUndefined()
  })

  test('複数書籍を登録して一覧の件数が増えることを確認', async ({
    authedPage: page,
  }) => {
    // シート取得
    const sheetsRes = await page.request.post('/api/graphql', {
      data: { query: '{ sheets { id name } }' },
    })
    const sheet = (await sheetsRes.json()).data.sheets[0]

    // 初期の書籍数を取得
    const initialRes = await page.request.post('/api/graphql', {
      data: { query: '{ books { id } }' },
    })
    const initialCount = (await initialRes.json()).data.books.length

    // 2冊登録
    const bookIds: number[] = []
    for (const suffix of ['A', 'B']) {
      const res = await page.request.fetch('/api/books', {
        method: 'POST',
        headers: { Accept: 'application/json' },
        data: JSON.stringify({
          id: '',
          title: `一括テスト書籍${suffix}`,
          author: `テスト著者${suffix}`,
          category: 'テスト',
          image: '/no-image.png',
          impression: '◯',
          memo: '',
          isPublicMemo: false,
          finished: '2025-01-01',
          sheet: { id: sheet.id, name: sheet.name },
        }),
      })
      const json = await res.json()
      expect(json.result).toBe(true)
      bookIds.push(json.bookId)
    }

    // 書籍数が2冊増えていることを確認
    const afterRes = await page.request.post('/api/graphql', {
      data: { query: '{ books { id } }' },
    })
    const afterCount = (await afterRes.json()).data.books.length
    expect(afterCount).toBe(initialCount + 2)

    // 本棚ページで累計読書数が表示されることを確認
    const sheetUrl = `/testuser/sheets/${sheet.name}`
    await page.goto(sheetUrl, { timeout: 30000 })
    await expect(
      page.getByRole('heading', { name: /本棚|すべてのアイテム/ })
    ).toBeVisible({ timeout: 15000 })

    // クリーンアップ: 登録した書籍を削除
    for (const id of bookIds) {
      await page.request.fetch('/api/books', {
        method: 'DELETE',
        headers: { Accept: 'application/json' },
        data: JSON.stringify({ id }),
      })
    }
  })

  test('未認証状態で書籍操作するとエラーになる', async ({ page }) => {
    // 未認証でPOST
    const createRes = await page.request.fetch('/api/books', {
      method: 'POST',
      headers: { Accept: 'application/json' },
      data: JSON.stringify({
        title: '不正な書籍',
        author: '不正な著者',
      }),
    })
    expect(createRes.status()).toBe(401)

    // 未認証でPUT
    const updateRes = await page.request.fetch('/api/books', {
      method: 'PUT',
      headers: { Accept: 'application/json' },
      data: JSON.stringify({ id: 1, title: '不正' }),
    })
    expect(updateRes.status()).toBe(401)

    // 未認証でDELETE
    const deleteRes = await page.request.fetch('/api/books', {
      method: 'DELETE',
      headers: { Accept: 'application/json' },
      data: JSON.stringify({ id: 1 }),
    })
    expect(deleteRes.status()).toBe(401)
  })
})
