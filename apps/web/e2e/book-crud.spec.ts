import { test, expect } from './fixtures'

test.describe('書籍CRUD操作（API経由）', () => {
  test('認証済みで書籍一覧を取得できる', async ({ authedPage: page }) => {
    const res = await page.request.post('/api/graphql', {
      data: { query: '{ books { id title author category impression } }' },
    })
    const json = await res.json()
    expect(json.data.books).toBeInstanceOf(Array)
    expect(json.data.books.length).toBeGreaterThan(0)

    // seedデータの書籍が含まれることを確認
    const titles = json.data.books.map((b: { title: string }) => b.title)
    expect(titles).toContain('トレーダーの精神分析')
  })

  test('認証済みでシート一覧を取得できる', async ({ authedPage: page }) => {
    const res = await page.request.post('/api/graphql', {
      data: { query: '{ sheets { id name } }' },
    })
    const json = await res.json()
    expect(json.data.sheets).toBeInstanceOf(Array)
    expect(json.data.sheets.length).toBeGreaterThan(0)

    const names = json.data.sheets.map((s: { name: string }) => s.name)
    expect(names).toContain('本棚')
  })

  test('認証済みでカテゴリ一覧を取得できる', async ({ authedPage: page }) => {
    const res = await page.request.post('/api/graphql', {
      data: { query: '{ bookCategories }' },
    })
    const json = await res.json()
    expect(json.data.bookCategories).toBeInstanceOf(Array)
    expect(json.data.bookCategories.length).toBeGreaterThan(0)
  })

  test('書籍の新規登録・更新・削除ができる', async ({ authedPage: page }) => {
    // 1. シート取得
    const sheetsRes = await page.request.post('/api/graphql', {
      data: { query: '{ sheets { id name } }' },
    })
    const sheetsJson = await sheetsRes.json()
    const sheet = sheetsJson.data.sheets[0]

    // 2. 書籍登録（API経由 — フロントエンドと同じくbodyを文字列で送信）
    const createRes = await page.request.fetch('/api/books', {
      method: 'POST',
      headers: { Accept: 'application/json' },
      data: JSON.stringify({
        id: '',
        title: 'E2Eテスト書籍',
        author: 'テスト著者',
        category: 'テスト',
        image: '/no-image.png',
        impression: '◯',
        memo: 'これはE2Eテスト用のメモです',
        isPublicMemo: true,
        finished: '2025-01-01',
        sheet: { id: sheet.id, name: sheet.name },
      }),
    })
    const createJson = await createRes.json()
    expect(createJson.result).toBe(true)
    expect(createJson.bookTitle).toBe('E2Eテスト書籍')
    const bookId = createJson.bookId

    // 3. 登録した書籍が一覧に含まれることを確認
    const booksRes = await page.request.post('/api/graphql', {
      data: { query: '{ books { id title } }' },
    })
    const booksJson = await booksRes.json()
    const found = booksJson.data.books.find(
      (b: { id: string }) => b.id === String(bookId)
    )
    expect(found).toBeDefined()
    expect(found.title).toBe('E2Eテスト書籍')

    // 4. 書籍更新
    const updateRes = await page.request.fetch('/api/books', {
      method: 'PUT',
      headers: { Accept: 'application/json' },
      data: JSON.stringify({
        id: bookId,
        title: 'E2Eテスト書籍（更新済み）',
        author: 'テスト著者（更新済み）',
        category: 'テスト',
        image: '/no-image.png',
        impression: '◎',
        memo: '更新されたメモ',
        isPublicMemo: true,
        finished: '2025-02-01',
      }),
    })
    const updateJson = await updateRes.json()
    expect(updateJson.result).toBe(true)

    // 5. 更新が反映されていることを確認
    const updatedBooksRes = await page.request.post('/api/graphql', {
      data: {
        query: '{ books { id title author impression } }',
      },
    })
    const updatedBooksJson = await updatedBooksRes.json()
    const updatedBook = updatedBooksJson.data.books.find(
      (b: { id: string }) => b.id === String(bookId)
    )
    expect(updatedBook.title).toBe('E2Eテスト書籍（更新済み）')
    expect(updatedBook.author).toBe('テスト著者（更新済み）')

    // 6. 書籍削除
    const deleteRes = await page.request.fetch('/api/books', {
      method: 'DELETE',
      headers: { Accept: 'application/json' },
      data: JSON.stringify({ id: bookId }),
    })
    const deleteJson = await deleteRes.json()
    expect(deleteJson.result).toBe(true)

    // 7. 削除後に一覧に含まれないことを確認
    const afterDeleteRes = await page.request.post('/api/graphql', {
      data: { query: '{ books { id title } }' },
    })
    const afterDeleteJson = await afterDeleteRes.json()
    const deleted = afterDeleteJson.data.books.find(
      (b: { id: string }) => b.id === String(bookId)
    )
    expect(deleted).toBeUndefined()
  })

  test('未認証で書籍登録するとエラーになる', async ({ page }) => {
    const res = await page.request.fetch('/api/books', {
      method: 'POST',
      headers: { Accept: 'application/json' },
      data: JSON.stringify({
        title: '不正な書籍',
        author: '不正な著者',
      }),
    })
    // 未認証時は401エラーが返る
    expect(res.status()).toBe(401)
  })
})
