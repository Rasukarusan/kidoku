import type { NextApiRequest, NextApiResponse } from 'next'
import { put } from '@vercel/blob'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import formidable from 'formidable'
import fs from 'fs'

// FormDataのパースのためbodyParserを無効化
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
    // FormDataをパース
    const form = formidable({ maxFileSize: 10 * 1024 * 1024 }) // 10MB
    const [fields, files] = await form.parse(req)

    const file = Array.isArray(files.file) ? files.file[0] : files.file
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    // ファイルを読み込み
    const fileBuffer = fs.readFileSync(file.filepath)

    // Vercel Blobにアップロード
    const blob = await put(file.originalFilename || 'image', fileBuffer, {
      access: 'public',
      contentType: file.mimetype || 'image/jpeg',
    })

    // 一時ファイル削除
    fs.unlinkSync(file.filepath)

    return res.status(200).json({ url: blob.url })
  } catch (error) {
    console.error('Upload error:', error)
    return res.status(400).json({
      error: (error as Error).message,
    })
  }
}
