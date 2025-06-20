import {
  isSoftwareDesignISBN,
  generateSoftwareDesignImageUrl,
  generateSoftwareDesignDetailUrl,
  searchSoftwareDesign,
  getLatestSoftwareDesign,
  getSoftwareDesignByYear,
} from '../softwareDesignApi'

describe('softwareDesignApi', () => {
  describe('isSoftwareDesignISBN', () => {
    it('技術評論社のISBNを正しく判定する', () => {
      expect(isSoftwareDesignISBN('978-4-297-14815-7')).toBe(true)
      expect(isSoftwareDesignISBN('9784297148157')).toBe(true)
    })

    it('他社のISBNを正しく判定する', () => {
      expect(isSoftwareDesignISBN('978-4-274-12345-6')).toBe(false)
      expect(isSoftwareDesignISBN('978-4-123-45678-9')).toBe(false)
    })

    it('タイトルでSoftware Designを判定する', () => {
      expect(
        isSoftwareDesignISBN('978-4-123-45678-9', 'Software Design 2025年7月号')
      ).toBe(true)
      expect(
        isSoftwareDesignISBN('978-4-123-45678-9', 'ソフトウェアデザイン')
      ).toBe(true)
      expect(isSoftwareDesignISBN('978-4-123-45678-9', 'Web+DB PRESS')).toBe(
        false
      )
    })
  })

  describe('generateSoftwareDesignImageUrl', () => {
    it('正しい画像URLを生成する', () => {
      const url = generateSoftwareDesignImageUrl(2025, 7)
      expect(url).toBe(
        'https://gihyo.jp/assets/images/cover/2025/thumb/TH800_642507.jpg'
      )
    })

    it('1桁の月でも正しくパディングする', () => {
      const url = generateSoftwareDesignImageUrl(2025, 1)
      expect(url).toBe(
        'https://gihyo.jp/assets/images/cover/2025/thumb/TH800_642501.jpg'
      )
    })
  })

  describe('generateSoftwareDesignDetailUrl', () => {
    it('正しい詳細ページURLを生成する', () => {
      const url = generateSoftwareDesignDetailUrl(2025, 7)
      expect(url).toBe('https://gihyo.jp/magazine/SD/archive/2025/202507')
    })

    it('1桁の月でも正しくパディングする', () => {
      const url = generateSoftwareDesignDetailUrl(2025, 1)
      expect(url).toBe('https://gihyo.jp/magazine/SD/archive/2025/202501')
    })
  })

  describe('searchSoftwareDesign', () => {
    it('Software Designの書籍情報を返す', async () => {
      const result = await searchSoftwareDesign('978-4-297-14815-7', 2025, 7)

      expect(result).toBeDefined()
      expect(result?.title).toBe('Software Design 2025年7月号')
      expect(result?.author).toBe('技術評論社')
      expect(result?.category).toBe('プログラミング/技術雑誌')
      expect(result?.image).toContain('gihyo.jp')
    })

    it('年月を指定しない場合は現在の年月を使用する', async () => {
      const now = new Date()
      const result = await searchSoftwareDesign('978-4-297-14815-7')

      expect(result).toBeDefined()
      expect(result?.title).toContain(
        `${now.getFullYear()}年${now.getMonth() + 1}月号`
      )
    })
  })

  describe('getLatestSoftwareDesign', () => {
    it('最新のSoftware Designを取得する', async () => {
      const result = await getLatestSoftwareDesign()

      expect(result).toBeDefined()
      expect(result?.title).toContain('Software Design')
      expect(result?.author).toBe('技術評論社')
    })
  })

  describe('getSoftwareDesignByYear', () => {
    it('指定年の12ヶ月分のSoftware Designを返す', async () => {
      const results = await getSoftwareDesignByYear(2025)

      expect(results).toHaveLength(12)
      expect(results[0].title).toBe('Software Design 2025年1月号')
      expect(results[11].title).toBe('Software Design 2025年12月号')
    })

    it('すべての結果に正しい情報が含まれている', async () => {
      const results = await getSoftwareDesignByYear(2025)

      results.forEach((result, index) => {
        expect(result.author).toBe('技術評論社')
        expect(result.category).toBe('プログラミング/技術雑誌')
        expect(result.image).toContain('gihyo.jp')
        expect(result.title).toContain(`${index + 1}月号`)
      })
    })
  })
})
