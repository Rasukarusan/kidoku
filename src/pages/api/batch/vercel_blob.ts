import prisma from '@/libs/prisma'
import sharp from 'sharp'
import type { NextApiResponse, NextApiRequest } from 'next'
import { del as blob_del, list, put } from '@vercel/blob'

const get = async (request: NextApiRequest, response: NextApiResponse) => {
  const res = await list()
  return response.status(200).json(res)
}

const post = async (request: NextApiRequest, response: NextApiResponse) => {
  const books = await prisma.books.findMany({
    where: { sheet_id: 1 },
  })
  // const books = r.slice(0, 2)
  for (let i = 0; i < books.length; i++) {
    const book = books[i]
    const path = `${book.id}.webp`
    const res = await (await fetch(book.image)).arrayBuffer()
    // webpに変換し、VercelBlobにアップロード
    sharp(res)
      .resize(158)
      .webp({ quality: 90 })
      .toBuffer(async (err, info) => {
        if (err) {
          throw err
        }
        const { url } = await put('hoge.webp', info, {
          access: 'public',
        })
        await prisma.books.update({
          where: { id: book.id },
          data: {
            image: url,
          },
        })
      })
  }
  return response.status(200).json({ result: true })
}
const del = async (request: NextApiRequest, response: NextApiResponse) => {
  const url =
    'https://ne0h3gml3ggcpadq.public.blob.vercel-storage.com/hoge-PWQXtkUTOnlNgXwKu4rdTckqzqJgpB'
  await blob_del(url)
  return response.status(200).json({ result: true })
}

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  if (request.method === 'GET') {
    return get(request, response)
  } else if (request.method === 'POST') {
    return post(request, response)
  } else if (request.method === 'DELETE') {
    return del(request, response)
  }
  return response.status(200).json({ result: true })
}
