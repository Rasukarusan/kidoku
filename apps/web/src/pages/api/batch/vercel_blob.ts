import prisma from '@/libs/prisma'
import type { NextApiResponse, NextApiRequest } from 'next'
import { del as blob_del, list, put } from '@vercel/blob'
import { isAdmin } from '@/utils/api'
import { bufferToWebp } from '@/libs/sharp/bufferToWebp'

const get = async (request: NextApiRequest, response: NextApiResponse) => {
  const res = await list()
  return response.status(200).json(res)
}

const post = async (request: NextApiRequest, response: NextApiResponse) => {
  const books = await prisma.books.findMany({ where: { sheetId: 9 } })
  // const books = r.slice(0, 2)
  for (let i = 0; i < books.length; i++) {
    const book = books[i]
    const path = `${book.id}.webp`
    if (!book.image.includes('http')) {
      continue
    }
    // webpに変換し、VercelBlobにアップロード
    const res = await (await fetch(book.image)).arrayBuffer()
    const buffer = await bufferToWebp(res)
    const { url } = await put(path, buffer, {
      access: 'public',
    })
    console.log(url)
    await prisma.books.update({
      where: { id: book.id },
      data: {
        image: url,
      },
    })
  }
  return response.status(200).json({ result: true })
}
const del = async (request: NextApiRequest, response: NextApiResponse) => {
  // 全削除
  // const li = await list()
  // li.blobs.forEach((v) => {
  //   blob_del(v.url)
  // })
  const url =
    'https://ne0h3gml3ggcpadq.public.blob.vercel-storage.com/hoge-PWQXtkUTOnlNgXwKu4rdTckqzqJgpB'
  await blob_del(url)
  return response.status(200).json({ result: true })
}

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  if (!isAdmin(request)) {
    return response.status(401).json({ result: false })
  }
  if (request.method === 'GET') {
    return get(request, response)
  } else if (request.method === 'POST') {
    return post(request, response)
  } else if (request.method === 'DELETE') {
    return del(request, response)
  }
  return response.status(200).json({ result: true })
}
