import type { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'
import { searchSoftwareDesign } from '@/utils/softwareDesignApi'
import { SearchResult } from '@/types/search'

type Data = {
  success: boolean
  data?: SearchResult
  error?: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
    })
  }

  try {
    // 認証チェック
    const session = await getSession({ req })
    if (!session) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
      })
    }

    // パラメータから年月を取得
    const { year, month } = req.query

    if (!year || !month) {
      return res.status(400).json({
        success: false,
        error: 'Year and month are required',
      })
    }

    const yearNum = parseInt(year as string, 10)
    const monthNum = parseInt(month as string, 10)

    // バリデーション
    if (isNaN(yearNum) || isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
      return res.status(400).json({
        success: false,
        error: 'Invalid year or month',
      })
    }

    // 仮のISBN（実際には年月に対応するISBNを取得する必要がある）
    const dummyISBN = `978-4-297-${yearNum}${monthNum.toString().padStart(2, '0')}`

    // 指定年月のSoftware Designを取得
    const result = await searchSoftwareDesign(dummyISBN, yearNum, monthNum)

    if (!result) {
      return res.status(404).json({
        success: false,
        error: 'Software Design not found',
      })
    }

    return res.status(200).json({
      success: true,
      data: result,
    })
  } catch (error) {
    console.error('Error fetching Software Design:', error)
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    })
  }
}
