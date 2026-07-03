import { parseCsv, parseBookmeterCsv } from './bookmeterCsv'

describe('parseCsv()', () => {
  it('カンマ区切りの行がパースできること', () => {
    const result = parseCsv('a,b,c\nd,e,f')
    expect(result).toEqual([
      ['a', 'b', 'c'],
      ['d', 'e', 'f'],
    ])
  })
  it('ダブルクォートで囲まれたフィールド(カンマ・改行・エスケープ含む)がパースできること', () => {
    const result = parseCsv('"a,1","b\n2","c""3"')
    expect(result).toEqual([['a,1', 'b\n2', 'c"3']])
  })
  it('先頭のBOMが除去されること', () => {
    const result = parseCsv('\uFEFFtitle,author\nabc,def')
    expect(result).toEqual([
      ['title', 'author'],
      ['abc', 'def'],
    ])
  })
  it('CRLF改行に対応していること', () => {
    const result = parseCsv('a,b\r\nc,d\r\n')
    expect(result).toEqual([
      ['a', 'b'],
      ['c', 'd'],
    ])
  })
  it('空行が除外されること', () => {
    const result = parseCsv('a,b\n\n,\nc,d\n')
    expect(result).toEqual([
      ['a', 'b'],
      ['c', 'd'],
    ])
  })
})

describe('parseBookmeterCsv()', () => {
  describe('bookmeter_exporter形式(ヘッダーなし: ASIN/ISBN,読了日,感想)', () => {
    it('ISBN10/ISBN13の行がパースできること', () => {
      const csv =
        '4408167967,2021/06/02,ここまで読んだ\n9784297127473,2022/01/15,""'
      const result = parseBookmeterCsv(csv)
      expect(result.format).toBe('bookmeter_exporter')
      expect(result.books).toEqual([
        {
          line: 1,
          isbn: '4408167967',
          finished: '2021/06/02',
          memo: 'ここまで読んだ',
        },
        { line: 2, isbn: '9784297127473', finished: '2022/01/15', memo: '' },
      ])
      expect(result.invalidLines).toEqual([])
    })
    it('ASIN(Kindle本)の行がパースできること', () => {
      const csv = 'B071K5WM6P,2021/07/31,This book is awesome!'
      const result = parseBookmeterCsv(csv)
      expect(result.format).toBe('bookmeter_exporter')
      expect(result.books).toEqual([
        {
          line: 1,
          asin: 'B071K5WM6P',
          finished: '2021/07/31',
          memo: 'This book is awesome!',
        },
      ])
    })
    it('ISBNともASINとも判定できない行はinvalidLinesに入ること', () => {
      const csv =
        '4408167967,2021/06/02,感想\n1234567890,2021/06/03,チェックディジット不正'
      const result = parseBookmeterCsv(csv)
      expect(result.books).toHaveLength(1)
      expect(result.invalidLines).toEqual([
        { line: 2, value: '1234567890,2021/06/03,チェックディジット不正' },
      ])
    })
    it('感想にカンマや改行が含まれていてもパースできること', () => {
      const csv =
        '4408167967,2021/06/02,"面白かった、また読みたい\n続編も楽しみ"'
      const result = parseBookmeterCsv(csv)
      expect(result.books[0].memo).toBe(
        '面白かった、また読みたい\n続編も楽しみ'
      )
    })
  })

  describe('export_bookmeter形式(ヘッダーあり: title,author(s),cover)', () => {
    it('ヘッダー付きCSVがパースできること', () => {
      const csv =
        'title,author(s),cover\n' +
        'テスト駆動開発,Kent Beck,https://example.com/cover1.jpg\n' +
        '"リファクタリング","Martin Fowler,児玉公信",https://example.com/cover2.jpg'
      const result = parseBookmeterCsv(csv)
      expect(result.format).toBe('export_bookmeter')
      expect(result.books).toEqual([
        {
          line: 2,
          title: 'テスト駆動開発',
          author: 'Kent Beck',
          image: 'https://example.com/cover1.jpg',
        },
        {
          line: 3,
          title: 'リファクタリング',
          author: 'Martin Fowler,児玉公信',
          image: 'https://example.com/cover2.jpg',
        },
      ])
    })
    it('BOM付きヘッダーでも判定できること', () => {
      const csv = '\uFEFFtitle,author(s),cover\n本のタイトル,著者名,'
      const result = parseBookmeterCsv(csv)
      expect(result.format).toBe('export_bookmeter')
      expect(result.books[0]).toEqual({
        line: 2,
        title: '本のタイトル',
        author: '著者名',
        image: '',
      })
    })
    it('タイトルが空の行はinvalidLinesに入ること', () => {
      const csv = 'title,author(s),cover\n,著者だけ,https://example.com/x.jpg'
      const result = parseBookmeterCsv(csv)
      expect(result.books).toEqual([])
      expect(result.invalidLines).toEqual([
        { line: 2, value: ',著者だけ,https://example.com/x.jpg' },
      ])
    })
  })

  describe('フォーマット判定エラー', () => {
    it('空のCSVはエラーになること', () => {
      expect(() => parseBookmeterCsv('')).toThrow('CSVにデータがありません')
    })
    it('どちらの形式にも該当しないCSVはエラーになること', () => {
      const csv = 'シート名,タイトル,著者\n2024,ある本,ある著者'
      expect(() => parseBookmeterCsv(csv)).toThrow(
        '読書メーターのエクスポートCSV形式として認識できませんでした'
      )
    })
  })
})
