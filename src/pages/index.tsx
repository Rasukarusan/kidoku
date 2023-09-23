import { IndexPage } from '@/features/index/components/IndexPage'
export default IndexPage

import prisma, { parse } from '@/libs/prisma'

export const getStaticProps = async (ctx) => {
  const users = await prisma.user.findMany({
    select: { name: true, image: true },
  })
  return {
    props: { users: parse(users) },
  }
}
