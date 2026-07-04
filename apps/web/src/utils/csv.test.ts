import { parseCSV } from './csv'

describe('parseCSV', () => {
  it('単純なCSVをパースできる', () => {
    expect(parseCSV('a,b,c\nd,e,f')).toEqual([
      ['a', 'b', 'c'],
      ['d', 'e', 'f'],
    ])
  })

  it('クォート内のカンマ・改行・エスケープされたクォートを扱える', () => {
    const csv = '"a,1","b\nc","he said ""hi"""\nx,y,z'
    expect(parseCSV(csv)).toEqual([
      ['a,1', 'b\nc', 'he said "hi"'],
      ['x', 'y', 'z'],
    ])
  })

  it('CRLF改行とBOMを扱える', () => {
    const csv = '﻿タイトル,著者\r\n本A,著者A\r\n'
    expect(parseCSV(csv)).toEqual([
      ['タイトル', '著者'],
      ['本A', '著者A'],
    ])
  })

  it('空行は除外される', () => {
    expect(parseCSV('a,b\n\nc,d\n')).toEqual([
      ['a', 'b'],
      ['c', 'd'],
    ])
  })

  it('空文字列は空配列を返す', () => {
    expect(parseCSV('')).toEqual([])
  })
})
