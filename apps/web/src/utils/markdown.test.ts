import { expandBlankLines } from './markdown'

const NBSP = String.fromCharCode(0xa0)

describe('expandBlankLines()', () => {
  it('段落区切り(空行1つ)はそのまま維持されること', () => {
    const input = 'A\n\nB'
    expect(expandBlankLines(input)).toBe('A\n\nB')
  })

  it('単一改行はそのまま維持されること(remark-breaks側で処理するため)', () => {
    const input = 'A\nB'
    expect(expandBlankLines(input)).toBe('A\nB')
  })

  it('空行2つ(改行3つ)が空段落1つに展開されること', () => {
    const input = 'A\n\n\nB'
    expect(expandBlankLines(input)).toBe(`A\n\n${NBSP}\n\nB`)
  })

  it('空行3つ(改行4つ)が空段落2つに展開されること', () => {
    const input = 'A\n\n\n\nB'
    expect(expandBlankLines(input)).toBe(`A\n\n${NBSP}\n\n${NBSP}\n\nB`)
  })

  it('CRLFが正規化されて処理されること', () => {
    const input = 'A\r\n\r\n\r\nB'
    expect(expandBlankLines(input)).toBe(`A\n\n${NBSP}\n\nB`)
  })

  it('空文字の場合は空文字が返ること', () => {
    expect(expandBlankLines('')).toBe('')
  })
})
