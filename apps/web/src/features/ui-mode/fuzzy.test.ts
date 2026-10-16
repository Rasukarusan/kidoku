import { fuzzyFilter, fuzzyMatch } from './fuzzy'

describe('fuzzyMatch', () => {
  it('matches characters as a subsequence and returns their positions', () => {
    expect(fuzzyMatch('Clean Code', 'cc')?.positions).toEqual([0, 6])
    expect(fuzzyMatch('Clean Code', 'cx')).toBeNull()
  })

  it('ignores case and full-width differences', () => {
    expect(fuzzyMatch('ＤＤＤ入門', 'ddd')).not.toBeNull()
    expect(fuzzyMatch('ddd入門', 'ＤＤＤ')).not.toBeNull()
    expect(fuzzyMatch('リーダブルコード', 'りーだ')?.positions).toEqual([
      0, 1, 2,
    ])
    expect(fuzzyMatch('ﾘｰﾀﾞﾌﾞﾙ', 'りー')).not.toBeNull()
  })

  it('requires every space-separated term to match', () => {
    expect(
      fuzzyMatch('1  リーダブルコード  著者A', 'コード 著者')
    ).not.toBeNull()
    expect(fuzzyMatch('1  リーダブルコード  著者A', 'コード 著者B')).toBeNull()
  })

  it('prefers consecutive matches over scattered ones', () => {
    const tight = fuzzyMatch('xxabc', 'abc')!
    const loose = fuzzyMatch('axbxc', 'abc')!
    expect(tight.score).toBeGreaterThan(loose.score)
  })
})

describe('fuzzyFilter', () => {
  it('sorts by score and keeps the original order for ties', () => {
    const items = ['axxxb', 'zab', 'ab', 'zzz']
    expect(fuzzyFilter(items, 'ab', (item) => item).map((m) => m.item)).toEqual(
      ['ab', 'zab', 'axxxb']
    )
    expect(fuzzyFilter(items, '', (item) => item).map((m) => m.item)).toEqual(
      items
    )
  })
})
