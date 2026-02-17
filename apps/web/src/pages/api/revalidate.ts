import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { bookId, secret } = req.query

  if (secret !== process.env.REVALIDATE_SECRET) {
    return res.status(401).json({ message: 'Invalid secret' })
  }

  if (!bookId) {
    return res.status(400).json({ message: 'bookId is required' })
  }

  try {
    await res.revalidate(`/books/${bookId}`)
    return res.json({ revalidated: true })
  } catch {
    return res.status(500).json({ message: 'Error revalidating' })
  }
}
