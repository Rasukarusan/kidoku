import prisma from '@/libs/prisma'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import dayjs from 'dayjs'
import { getServerSession } from 'next-auth/next'
import { mask } from '@/utils/string'

export default async (req, res) => {
  try {
    const session = await getServerSession(req, res, authOptions)
    if (!session) {
      return res.status(200).json({ result: false, book: undefined })
    }
    const userId = session.user.id
    const book = await prisma.books.findFirst({
      where: { id: Number(req.query.bookId) },
    })

    if (!book) {
      return res.status(404).json({ result: false, book: undefined })
    }

    const isOwner = userId === book.userId
    const sanitizedBook = { ...book }

    // セキュリティ: 非公開メモは所有者以外に送信しない
    if (!isOwner && !book.is_public_memo) {
      sanitizedBook.memo = null
    } else if (!isOwner && book.is_public_memo) {
      // 公開メモの場合、マスキングを適用
      sanitizedBook.memo = mask(book.memo || '')
    }

    const month = book.finished
      ? dayjs(book.finished).format('M') + '月'
      : dayjs().format('M') + '月' // まだ読み終わっていない場合は今月とする

    return res
      .status(200)
      .json({ result: true, book: { ...sanitizedBook, month } })
  } catch (e) {
    console.error(e)
    return res.status(400).json({ result: false })
  }
}
