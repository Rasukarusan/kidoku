import type { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'
import { getLatestSoftwareDesign } from '@/utils/softwareDesignApi'
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

    // 最新のSoftware Designを取得
    const result = await getLatestSoftwareDesign()

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
    console.error('Error fetching latest Software Design:', error)
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    })
  }
}
