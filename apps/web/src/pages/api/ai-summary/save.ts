import prisma from '@/libs/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]'

export default async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ result: false })
  }

  try {
    const session = await getServerSession(req, res, authOptions)
    if (!session) {
      return res.status(401).json({ result: false })
    }
    const userId = session.user.id
    const { sheetName, analysis } = req.body

    // Validate analysis JSON structure
    const requiredKeys = [
      'reading_trend_analysis',
      'sentiment_analysis',
      'what_if_scenario',
      'overall_feedback',
    ]
    const hasAllKeys = requiredKeys.every((key) => key in analysis)
    if (!hasAllKeys) {
      return res.status(400).json({ result: false, error: 'Invalid analysis format' })
    }

    const sheet = await prisma.sheets.findFirst({
      where: { userId, name: sheetName },
      select: { id: true },
    })
    if (!sheet) {
      return res.status(404).json({ result: false, error: 'Sheet not found' })
    }

    const {
      reading_trend_analysis,
      sentiment_analysis,
      what_if_scenario,
      overall_feedback,
    } = analysis

    await prisma.aiSummaries.create({
      data: {
        userId,
        sheet_id: sheet.id,
        analysis: {
          reading_trend_analysis,
          sentiment_analysis,
          what_if_scenario,
          overall_feedback,
        },
        token: 0, // 手動セットの場合はトークン使用なし
      },
    })

    return res.status(200).json({ result: true })
  } catch (e) {
    console.error(e)
    return res.status(500).json({ result: false })
  }
}
