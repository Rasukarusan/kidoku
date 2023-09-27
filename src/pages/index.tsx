import { IndexPage } from '@/features/index/components/IndexPage'
export default IndexPage

import prisma from '@/libs/prisma'

export const getStaticProps = async (ctx) => {
  const users = await prisma.user.findMany({
    include: { books: { select: { category: true } } },
    take: 5,
  })
  const result = []
  users.map((user) => {
    const categoryCount: Record<string, number> = {}
    user.books.forEach((item) => {
      if (!categoryCount[item.category]) {
        categoryCount[item.category] = 0
      }
      categoryCount[item.category]++
    })
    const total = user.books.length
    const categories = Object.entries(categoryCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map((v) => {
        return {
          name: v[0],
          percent: Math.round((v[1] / total) * 100),
        }
      })
    result.push({
      name: user.name,
      image: user.image,
      books: { total, categories },
    })
  })
  return {
    props: { users: result },
  }
}
