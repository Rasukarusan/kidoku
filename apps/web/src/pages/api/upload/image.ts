import type { NextApiRequest, NextApiResponse } from 'next'
import { handleUpload } from '@vercel/blob/client'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'

// Vercel Blob client uploadにはbodyParserを無効化する必要がある
export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const session = await getServerSession(req, res, authOptions)
  if (!session?.user?.email) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  // 環境変数チェック
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error('BLOB_READ_WRITE_TOKEN is not set')
    return res.status(500).json({
      error: 'Server configuration error: BLOB_READ_WRITE_TOKEN is not set',
    })
  }

  try {
    const jsonResponse = await handleUpload({
      request: req,
      onBeforeGenerateToken: async (_pathname) => {
        // ファイル名の検証やカスタマイズが可能
        // 例: ユーザーIDをプレフィックスにする
        return {
          allowedContentTypes: [
            'image/jpeg',
            'image/png',
            'image/webp',
            'image/gif',
          ],
          tokenPayload: JSON.stringify({
            userId: session.user.email,
          }),
        }
      },
      onUploadCompleted: async ({ blob }) => {
        // アップロード完了後の処理（オプション）
        console.log('Upload completed:', blob.url)
      },
    })

    return res.status(200).json(jsonResponse)
  } catch (error) {
    console.error('Upload error:', error)
    return res.status(400).json({
      error: (error as Error).message,
      details: error instanceof Error ? error.stack : String(error),
    })
  }
}
