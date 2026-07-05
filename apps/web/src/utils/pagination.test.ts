import { parsePagination, DEFAULT_PER_PAGE, MAX_PER_PAGE } from './pagination'

describe('parsePagination', () => {
  it('パラメータ未指定ならデフォルト値を返す', () => {
    expect(parsePagination({})).toEqual({
      page: 1,
      perPage: DEFAULT_PER_PAGE,
    })
  })

  it('指定されたpage/perPageを返す', () => {
    expect(parsePagination({ page: '3', perPage: '50' })).toEqual({
      page: 3,
      perPage: 50,
    })
  })

  it('perPageが上限を超える場合は上限に切り詰める', () => {
    expect(parsePagination({ perPage: '1000' })).toEqual({
      page: 1,
      perPage: MAX_PER_PAGE,
    })
  })

  it('配列で渡された場合は先頭の値を使う', () => {
    expect(parsePagination({ page: ['2', '5'] })).toEqual({
      page: 2,
      perPage: DEFAULT_PER_PAGE,
    })
  })

  it.each([
    ['0', 'ゼロ'],
    ['-1', '負数'],
    ['abc', '数値以外'],
    ['1.5', '小数'],
    ['', '空文字'],
  ])('pageが不正な値(%s: %s)ならエラーを返す', (value) => {
    expect(parsePagination({ page: value })).toEqual({
      error: 'pageは1以上の整数で指定してください',
    })
  })

  it.each([
    ['0', 'ゼロ'],
    ['-1', '負数'],
    ['abc', '数値以外'],
  ])('perPageが不正な値(%s: %s)ならエラーを返す', (value) => {
    expect(parsePagination({ perPage: value })).toEqual({
      error: 'perPageは1以上の整数で指定してください',
    })
  })
})
