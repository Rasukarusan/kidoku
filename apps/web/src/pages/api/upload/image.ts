import type { NextApiRequest, NextApiResponse } from 'next'
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const session = await getServerSession(req, res, authOptions)
  if (!session?.user?.email) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const body = req.body as HandleUploadBody

  try {
    const jsonResponse = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async (pathname) => {
        // ファイル名の検証やカスタマイズが可能
        // 例: ユーザーIDをプレフィックスにする
        return {
          allowedContentTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
          tokenPayload: JSON.stringify({
            userId: session.user.email,
          }),
        }
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // アップロード完了後の処理（オプション）
        console.log('Upload completed:', blob.url)
      },
    })

    return res.status(200).json(jsonResponse)
  } catch (error) {
    return res.status(400).json({ error: (error as Error).message })
  }
}
