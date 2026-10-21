import prisma from '@/libs/prisma'
import dayjs from 'dayjs'
import { User } from 'next-auth'

export async function initUser(user: User) {
  const name = dayjs().format('YYYY')
  const userId = user.id
  const order = 1
  const res = await prisma.collection.create({
    data: { userId, name, position: order, description: '' },
  })
  return res
}
