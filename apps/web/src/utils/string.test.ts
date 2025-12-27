import MockDate from 'mockdate'
import { getLastModified, mask, truncate } from './string'

describe('truncate()', () => {
  it('空文字の場合は"-"が返ること', () => {
    const str = ''
    const len = 5
    const result = truncate(str, len)
    const expected = '-'
    expect(result).toBe(expected)
  })
  it('指定した長さで省略されること', () => {
    const str = '123456789'
    const len = 5
    const result = truncate(str, len)
    const expected = '12345...'
    expect(result).toBe(expected)
  })
  it('文字列が指定した長さより短い場合、何もせず文字列が返ること', () => {
    const str = '1234'
    const len = 5
    const result = truncate(str, len)
    const expected = '1234'
    expect(result).toBe(expected)
  })
  it('指定した行数で省略されること', () => {
    const str = '123\n456\n789'
    const len = 5
    const line = 2
    const result = truncate(str, len, line)
    const expected = '123\n456...'
    expect(result).toBe(expected)
  })
})

describe('mask()', () => {
  it('[[MASK: text]]形式の文字列がマスキングされて返ること', () => {
    const text = 'ここが[[MASK: マスクされる]]ところです'
    const result = mask(text)
    const expected = 'ここが*****ところです'
    expect(result).toEqual(expected)
  })
  it('[[MASK:text]]形式（スペースなし）の文字列がマスキングされて返ること', () => {
    const text = 'ここが[[MASK:マスクされる]]ところです'
    const result = mask(text)
    const expected = 'ここが*****ところです'
    expect(result).toEqual(expected)
  })
  it('マスク形式で囲まれていない場合はマスキングされないこと', () => {
    const text = 'ここはマスクされません'
    const result = mask(text)
    const expected = 'ここはマスクされません'
    expect(result).toEqual(expected)
  })
})

describe('getLastModified()', () => {
  beforeEach(() => {
    MockDate.set('2024-01-15T00:00:00Z')
  })
  afterEach(() => {
    MockDate.reset()
  })
  it.each([
    ['2024-01-14T23:59:00Z', 'ちょっと前'],
    ['2024-01-14T20:00:00Z', '4時間前'],
    ['2024-01-14T00:00:00Z', '1日前'],
    ['2023-12-15T00:00:00Z', '1ヶ月前'],
    ['2023-01-15T00:00:00Z', '1年前'],
  ])('時間に応じた文字列が返ること', (arg, expected) => {
    const result = getLastModified(arg)
    expect(result).toEqual(expected)
  })
})
