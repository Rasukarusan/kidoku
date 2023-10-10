import { IndexPage } from '@/features/index/components/IndexPage'
export default IndexPage

import prisma from '@/libs/prisma'

export const getStaticProps = async (ctx) => {
  const users = await prisma.user.findMany({
    include: {
      books: { select: { category: true } },
      sheets: {
        select: { name: true, order: true },
        orderBy: [{ order: 'desc' }],
      },
    },
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
    const sheet = user.sheets.length > 0 ? `${user.sheets[0].name}` : 'total'
    result.push({
      name: user.name,
      image: user.image,
      books: { total, categories },
      url: `/${user.name}/sheets/${sheet}`,
    })
  })
  result.sort((a, b) => b.books.total - a.books.total)
  return {
    props: { users: result },
    revalidate: 86400,
  }
}
