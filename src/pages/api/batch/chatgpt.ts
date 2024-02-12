import { chat } from '@/libs/openai/sse'
import type { NextApiResponse, NextApiRequest } from 'next'
// import { isAdmin } from '@/utils/api'
// import prisma from '@/libs/prisma/edge'

export const runtime = 'edge'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // const books = await prisma.books.findMany({
  //   where: { is_public_memo: true, sheet: { name: '2023' } },
  //   select: {
  //     category: true,
  //     memo: true,
  //   },
  // })
  // console.log(books)
  // fs.writeFileSync('file.txt', JSON.stringify(books))
  // const result = await chat(JSON.stringify(books))
  // if (!isAdmin(req)) {
  //   return new Response('false')
  // }

  return await chat('適当な自己紹介をしてください。50字程度で。')
}
