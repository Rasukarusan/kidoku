/**
 * ISBN関連のユーティリティ関数
 */

/**
 * ISBN-10のチェックディジットを検証
 */
export const validateISBN10 = (isbn: string): boolean => {
  if (!/^\d{9}[\dX]$/.test(isbn)) return false

  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += parseInt(isbn[i]) * (10 - i)
  }

  const checkDigit = isbn[9]
  const remainder = sum % 11
  const expectedCheckDigit =
    remainder === 0 ? '0' : remainder === 1 ? 'X' : (11 - remainder).toString()

  return checkDigit === expectedCheckDigit
}

/**
 * ISBN-13のチェックディジットを検証
 */
export const validateISBN13 = (isbn: string): boolean => {
  if (!/^\d{13}$/.test(isbn)) return false

  let sum = 0
  for (let i = 0; i < 12; i++) {
    sum += parseInt(isbn[i]) * (i % 2 === 0 ? 1 : 3)
  }

  const checkDigit = parseInt(isbn[12])
  const expectedCheckDigit = (10 - (sum % 10)) % 10

  return checkDigit === expectedCheckDigit
}

/**
 * ISBNの形式を検証（ISBN-10またはISBN-13）
 */
export const validateISBN = (isbn: string): boolean => {
  const cleanISBN = isbn.replace(/[-\s]/g, '')

  if (cleanISBN.length === 10) {
    return validateISBN10(cleanISBN)
  } else if (cleanISBN.length === 13) {
    return validateISBN13(cleanISBN)
  }

  return false
}

/**
 * ISBNを正規化（ハイフンとスペースを除去）
 */
export const normalizeISBN = (isbn: string): string => {
  return isbn.replace(/[-\s]/g, '')
}

/**
 * ISBN-10をISBN-13に変換
 */
export const convertISBN10to13 = (isbn10: string): string => {
  const cleanISBN = isbn10.replace(/[-\s]/g, '')
  if (cleanISBN.length !== 10) return isbn10

  // 978プレフィックスを追加
  const isbn13WithoutCheck = '978' + cleanISBN.substring(0, 9)

  // チェックディジットを計算
  let sum = 0
  for (let i = 0; i < 12; i++) {
    sum += parseInt(isbn13WithoutCheck[i]) * (i % 2 === 0 ? 1 : 3)
  }
  const checkDigit = (10 - (sum % 10)) % 10

  return isbn13WithoutCheck + checkDigit
}
