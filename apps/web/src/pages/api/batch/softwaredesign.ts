import type { NextApiRequest, NextApiResponse } from 'next'
import { isAdmin } from '@/utils/api'
import { getLatestSoftwareDesign } from '@/utils/softwareDesignApi'
import prisma from '@/libs/prisma'

type Data = {
  success: boolean
  message?: string
  error?: string
  data?: any
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    })
  }

  // 管理者権限チェック
  if (!isAdmin(req)) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized'
    })
  }

  try {
    // 最新のSoftware Designを取得
    const latestSD = await getLatestSoftwareDesign()
    
    if (!latestSD) {
      return res.status(404).json({
        success: false,
        error: 'Latest Software Design not found'
      })
    }

    // データベースに既に存在するかチェック
    const existingBook = await prisma.books.findFirst({
      where: {
        title: latestSD.title,
      }
    })

    if (existingBook) {
      return res.status(200).json({
        success: true,
        message: 'Latest Software Design already exists',
        data: existingBook
      })
    }

    // テンプレートとして登録（自動追加用）
    const template = await prisma.templateBooks.create({
      data: {
        name: latestSD.title,
        title: latestSD.title,
        author: latestSD.author,
        category: latestSD.category,
        image: latestSD.image,
        memo: `自動追加: ${new Date().toLocaleDateString('ja-JP')}`,
        isbn: latestSD.isbn || '',
      }
    })

    return res.status(200).json({
      success: true,
      message: 'Latest Software Design added as template',
      data: template
    })
  } catch (error) {
    console.error('Batch process error:', error)
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
}