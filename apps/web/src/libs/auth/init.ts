import prisma from '@/libs/prisma'
import dayjs from 'dayjs'
import { User } from 'next-auth'

export async function initUser(user: User) {
  const name = dayjs().format('YYYY')
  const userId = user.id
  const order = 1
  const res = await prisma.sheets.create({
    data: { userId, name, order },
  })
  return res
}
