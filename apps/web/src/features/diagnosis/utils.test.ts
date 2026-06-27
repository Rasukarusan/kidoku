import { normalizeDemoBooks, MAX_FIELD_LENGTH } from './utils'

describe('normalizeDemoBooks', () => {
  it('正常な1〜3冊の入力を正規化して返す', () => {
    const result = normalizeDemoBooks([
      { title: '本A', author: '著者A', category: '小説' },
      { title: '本B' },
    ])
    expect(result).toEqual([
      { title: '本A', author: '著者A', category: '小説' },
      { title: '本B', author: '', category: '' },
    ])
  })

  it('配列でない場合はnullを返す', () => {
    expect(normalizeDemoBooks(null)).toBeNull()
    expect(normalizeDemoBooks('本')).toBeNull()
    expect(normalizeDemoBooks({ title: '本' })).toBeNull()
  })

  it('空配列・4冊以上はnullを返す', () => {
    expect(normalizeDemoBooks([])).toBeNull()
    expect(
      normalizeDemoBooks([
        { title: '1' },
        { title: '2' },
        { title: '3' },
        { title: '4' },
      ])
    ).toBeNull()
  })

  it('タイトルが空・文字列でない要素が含まれるとnullを返す', () => {
    expect(normalizeDemoBooks([{ title: '' }])).toBeNull()
    expect(normalizeDemoBooks([{ title: '   ' }])).toBeNull()
    expect(normalizeDemoBooks([{ author: '著者' }])).toBeNull()
    expect(normalizeDemoBooks([null])).toBeNull()
    expect(normalizeDemoBooks(['本'])).toBeNull()
  })

  it('各フィールドをトリムし上限文字数で切り詰める', () => {
    const long = 'あ'.repeat(MAX_FIELD_LENGTH + 50)
    const result = normalizeDemoBooks([
      { title: `  ${long}  `, author: long, category: long },
    ])
    expect(result).not.toBeNull()
    expect(result![0].title).toHaveLength(MAX_FIELD_LENGTH)
    expect(result![0].author).toHaveLength(MAX_FIELD_LENGTH)
    expect(result![0].category).toHaveLength(MAX_FIELD_LENGTH)
  })
})
