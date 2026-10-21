import { test, expect } from './fixtures'

test('映画を登録し、再鑑賞と複数所属を記録できる', async ({
  authedPage: page,
  browser,
}) => {
  test.setTimeout(60000)
  const suffix = Date.now().toString()
  const firstName = `映画-${suffix}`
  const secondName = `お気に入り-${suffix}`
  const createCollection = async (name: string) => {
    const response = await page.request.post('/api/graphql', {
      data: {
        query:
          'mutation($input: SaveCollectionInput!) { saveCollection(input: $input) { id } }',
        variables: { input: { name, description: '' } },
      },
    })
    const result = await response.json()
    expect(result.errors).toBeUndefined()
    return result.data.saveCollection.id as number
  }
  const firstId = await createCollection(firstName)
  const secondId = await createCollection(secondName)
  let itemId: number | undefined
  try {
    await page.goto('/items/new')
    await page.getByLabel('種類', { exact: true }).selectOption('movie')
    await page
      .getByLabel('タイトル', { exact: true })
      .fill(`テスト映画-${suffix}`)
    await page.getByLabel(/^監督/).fill('監督A、監督B')
    await page.getByLabel('公開年', { exact: true }).fill('2026')
    await page.getByLabel(firstName, { exact: true }).check()
    await page.getByLabel(secondName, { exact: true }).check()
    await page.getByLabel('履歴も記録する', { exact: true }).check()
    await page.getByLabel(/^鑑賞日/).fill('2026-01-01')
    await page.getByRole('button', { name: '保存する', exact: true }).click()
    await expect(page).toHaveURL(/\/items\/\d+$/)
    itemId = Number(new URL(page.url()).pathname.split('/').pop())
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      `テスト映画-${suffix}`
    )
    await expect(page.getByRole('heading', { name: /^履歴/ })).toContainText(
      '1回'
    )

    await page.getByRole('button', { name: '＋ 履歴を追加' }).click()
    await page.getByLabel(/^鑑賞日/).fill('2026-02-01')
    const privateMemo = `自分だけの感想-${suffix}`
    await page.getByLabel('今回のメモ（自分だけに表示）').fill(privateMemo)
    await page.getByRole('button', { name: '保存', exact: true }).click()
    await expect(page.getByRole('heading', { name: /^履歴/ })).toContainText(
      '2回'
    )

    const publicContext = await browser.newContext({
      baseURL: new URL(page.url()).origin,
    })
    try {
      const publicPage = await publicContext.newPage()
      await publicPage.goto(`/items/${itemId}`)
      await expect(publicPage.getByRole('heading', { level: 1 })).toHaveText(
        `テスト映画-${suffix}`
      )
      await expect(publicPage.getByText(privateMemo)).not.toBeVisible()
    } finally {
      await publicContext.close()
    }

    const removeCollection = await page.request.post('/api/graphql', {
      data: {
        query: 'mutation($id: Int!) { deleteCollection(id: $id) }',
        variables: { id: firstId },
      },
    })
    expect((await removeCollection.json()).errors).toBeUndefined()
    const response = await page.request.post('/api/graphql', {
      data: {
        query:
          'query($id: Int!) { item(id: $id) { id collectionIds logs { id } } }',
        variables: { id: itemId },
      },
    })
    const result = await response.json()
    expect(result.errors).toBeUndefined()
    expect(result.data.item.collectionIds).toEqual([secondId])
    expect(result.data.item.logs).toHaveLength(2)

    const legacyResponse = await page.request.post('/api/graphql', {
      data: { query: '{ books { id } }' },
    })
    const legacy = await legacyResponse.json()
    expect(
      legacy.data.books.map((item: { id: string }) => Number(item.id))
    ).not.toContain(itemId)
  } finally {
    if (itemId)
      await page.request.post('/api/graphql', {
        data: {
          query: 'mutation($id: Int!) { deleteItem(id: $id) }',
          variables: { id: itemId },
        },
      })
    for (const id of [firstId, secondId])
      await page.request.post('/api/graphql', {
        data: {
          query: 'mutation($id: Int!) { deleteCollection(id: $id) }',
          variables: { id },
        },
      })
  }
})
