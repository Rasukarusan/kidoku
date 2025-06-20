import { SearchResult } from '@/types/search'
import { NO_IMAGE } from '@/libs/constants'

/**
 * Software DesignのISBNかどうかを判定
 * 技術評論社のISBNは978-4-297で始まることが多い
 * Software Design固有のパターンを含むタイトルでも判定
 */
export const isSoftwareDesignISBN = (isbn: string, title?: string): boolean => {
  const normalizedISBN = isbn.replace(/-/g, '')
  
  // Software DesignのISBNパターン（技術評論社）
  // 978-4-297-xxxxx の形式で、かつ特定の範囲
  // 注: より正確な判定のためには実際のISBN範囲の調査が必要
  const isTechReviewISBN = normalizedISBN.startsWith('9784297')
  
  // タイトルにSoftware Designが含まれているかチェック
  const isSoftwareDesignTitle = title ? 
    title.toLowerCase().includes('software design') || 
    title.includes('ソフトウェアデザイン') : 
    false
  
  return isTechReviewISBN || isSoftwareDesignTitle
}

/**
 * ISBNから年月を推定（Software Design用）
 * Software Designは月刊誌なので、発売月を推定可能
 */
export const extractYearMonthFromISBN = (isbn: string): { year: number; month: number } | null => {
  // ISBNの末尾から発売時期を推定するロジック
  // ※ これは仮の実装で、実際のISBNパターンに基づいて調整が必要
  const currentDate = new Date()
  return {
    year: currentDate.getFullYear(),
    month: currentDate.getMonth() + 1
  }
}

/**
 * Software Designの表紙画像URLを生成
 * パターン: https://gihyo.jp/assets/images/cover/{年}/thumb/TH800_64{年月下4桁}.jpg
 */
export const generateSoftwareDesignImageUrl = (year: number, month: number): string => {
  const yearStr = year.toString()
  const monthStr = month.toString().padStart(2, '0')
  const yearMonth = `${yearStr.slice(-2)}${monthStr}`
  
  return `https://gihyo.jp/assets/images/cover/${yearStr}/thumb/TH800_64${yearMonth}.jpg`
}

/**
 * Software Designの詳細ページURLを生成
 */
export const generateSoftwareDesignDetailUrl = (year: number, month: number): string => {
  const yearStr = year.toString()
  const monthStr = month.toString().padStart(2, '0')
  
  return `https://gihyo.jp/magazine/SD/archive/${yearStr}/${yearStr}${monthStr}`
}

/**
 * Software Designの書籍情報を取得
 */
export const searchSoftwareDesign = async (
  isbn: string,
  year?: number,
  month?: number
): Promise<SearchResult | undefined> => {
  try {
    // 年月が指定されていない場合は、現在の年月を使用
    const targetYear = year || new Date().getFullYear()
    const targetMonth = month || new Date().getMonth() + 1
    
    const imageUrl = generateSoftwareDesignImageUrl(targetYear, targetMonth)
    const detailUrl = generateSoftwareDesignDetailUrl(targetYear, targetMonth)
    
    // 画像の存在確認（オプション、ブラウザ環境でのみ実行）
    if (typeof window !== 'undefined' && typeof fetch !== 'undefined') {
      try {
        const response = await fetch(imageUrl, { method: 'HEAD' })
        if (!response.ok) {
          console.warn(`Software Design image not found: ${imageUrl}`)
        }
      } catch (error) {
        console.error('Failed to verify image URL:', error)
      }
    }
    
    return {
      id: isbn,
      title: `Software Design ${targetYear}年${targetMonth}月号`,
      author: '技術評論社',
      category: 'プログラミング/技術雑誌',
      image: imageUrl,
      memo: '',
      isbn: isbn,
    }
  } catch (error) {
    console.error('Software Design search error:', error)
    return undefined
  }
}

/**
 * 最新のSoftware Designを取得
 */
export const getLatestSoftwareDesign = async (): Promise<SearchResult | undefined> => {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1
  
  // 仮のISBN（実際には最新号のISBNを取得する必要がある）
  const dummyISBN = `978-4-297-${Date.now()}`
  
  return searchSoftwareDesign(dummyISBN, year, month)
}

/**
 * 指定された年のSoftware Designのリストを取得
 */
export const getSoftwareDesignByYear = async (year: number): Promise<SearchResult[]> => {
  const results: SearchResult[] = []
  
  for (let month = 1; month <= 12; month++) {
    const imageUrl = generateSoftwareDesignImageUrl(year, month)
    
    results.push({
      id: `sd-${year}-${month}`,
      title: `Software Design ${year}年${month}月号`,
      author: '技術評論社',
      category: 'プログラミング/技術雑誌',
      image: imageUrl,
      memo: '',
      isbn: '', // 実際のISBNは別途取得が必要
    })
  }
  
  return results
}