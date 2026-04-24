import { normalizeCategory } from './category'

describe('normalizeCategory()', () => {
  it('既存カテゴリが空の場合は取得カテゴリをそのまま返す', () => {
    expect(normalizeCategory('人文・エッセイ', [])).toBe('人文・エッセイ')
    expect(normalizeCategory('人文・エッセイ', null)).toBe('人文・エッセイ')
    expect(normalizeCategory('人文・エッセイ', undefined)).toBe(
      '人文・エッセイ'
    )
  })

  it('取得カテゴリが空の場合は空文字を返す', () => {
    expect(normalizeCategory('', ['エッセイ'])).toBe('')
    expect(normalizeCategory(null, ['エッセイ'])).toBe('')
    expect(normalizeCategory(undefined, ['エッセイ'])).toBe('')
  })

  it('完全一致する既存カテゴリがあればそれを返す', () => {
    expect(normalizeCategory('エッセイ', ['小説', 'エッセイ'])).toBe('エッセイ')
  })

  it('「・」区切りで分割したトークンが既存カテゴリと一致すればそれを返す', () => {
    expect(normalizeCategory('人文・エッセイ', ['エッセイ'])).toBe('エッセイ')
    expect(normalizeCategory('ビジネス・経済・就職', ['技術書', '経済'])).toBe(
      '経済'
    )
  })

  it('括弧区切りのカテゴリも分割してマッチする', () => {
    expect(normalizeCategory('漫画（コミック）', ['コミック'])).toBe('コミック')
    expect(normalizeCategory('漫画（コミック）', ['漫画'])).toBe('漫画')
  })

  it('既存カテゴリ側が複合名でも取得カテゴリと一致すれば既存を返す', () => {
    expect(normalizeCategory('エッセイ', ['人文・エッセイ'])).toBe(
      '人文・エッセイ'
    )
  })

  it('先頭に一致した既存カテゴリを返す（トークン順優先）', () => {
    expect(normalizeCategory('人文・エッセイ', ['エッセイ', '人文'])).toBe(
      '人文'
    )
  })

  it('どの既存カテゴリともマッチしなければ取得カテゴリをそのまま返す', () => {
    expect(normalizeCategory('医学・薬学', ['小説', 'エッセイ'])).toBe(
      '医学・薬学'
    )
  })

  it('前後空白をトリムしたうえでマッチ判定する', () => {
    expect(normalizeCategory('  人文・エッセイ  ', ['エッセイ'])).toBe(
      'エッセイ'
    )
  })

  it('既存カテゴリに空文字が混ざっていても無視する', () => {
    expect(normalizeCategory('エッセイ', ['', 'エッセイ'])).toBe('エッセイ')
  })
})
