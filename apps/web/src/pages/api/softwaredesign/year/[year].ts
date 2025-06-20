import type { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'
import { getSoftwareDesignByYear } from '@/utils/softwareDesignApi'
import { SearchResult } from '@/types/search'

type Data = {
  success: boolean
  data?: SearchResult[]
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

    // パラメータから年を取得
    const { year } = req.query

    if (!year) {
      return res.status(400).json({
        success: false,
        error: 'Year is required',
      })
    }

    const yearNum = parseInt(year as string, 10)

    // バリデーション
    if (
      isNaN(yearNum) ||
      yearNum < 2000 ||
      yearNum > new Date().getFullYear() + 1
    ) {
      return res.status(400).json({
        success: false,
        error: 'Invalid year',
      })
    }

    // 指定年のSoftware Designリストを取得
    const results = await getSoftwareDesignByYear(yearNum)

    return res.status(200).json({
      success: true,
      data: results,
    })
  } catch (error) {
    console.error('Error fetching Software Design list:', error)
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    })
  }
}
