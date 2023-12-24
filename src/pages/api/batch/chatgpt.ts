import prisma from '@/libs/prisma'
import type { NextApiResponse, NextApiRequest } from 'next'
import { isAdmin } from '@/utils/api'
import { chat } from '@/libs/openai/gpt'
// import fs from 'fs'

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  if (!isAdmin(request)) {
    return response.status(401).json({ result: false })
  }
  try {
    const books = await prisma.books.findMany({
      where: { is_public_memo: true, sheet: { name: '2023' } },
      select: {
        category: true,
        memo: true,
      },
    })
    console.log(JSON.stringify(books))
    // fs.writeFileSync('file.txt', JSON.stringify(books))
    const result = await chat(JSON.stringify(books))
    console.log(result)
    console.log(result.choices[0].message.content)
    return response.status(200).json({ result: true })
  } catch (error) {
    console.error(error)
    return response.status(200).json({ result: false })
  }
}
