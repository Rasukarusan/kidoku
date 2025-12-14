import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { path, secret } = req.body

  if (secret !== process.env.REVALIDATE_SECRET) {
    return res.status(401).json({ message: 'Invalid secret' })
  }

  if (!path) {
    return res.status(400).json({ message: 'Path is required' })
  }

  try {
    await res.revalidate(path)
    return res.json({ revalidated: true, path })
  } catch (err) {
    console.error('Revalidate error:', err)
    return res.status(500).json({ message: 'Error revalidating' })
  }
}
