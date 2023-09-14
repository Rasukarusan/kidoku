import { IndexPage } from '@/features/index/components/IndexPage'
export default IndexPage

import type { GetServerSideProps } from 'next'
import prisma, { parse } from '@/libs/prisma'

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const sheets = await prisma.sheets.findMany()
  return {
    props: { sheets: parse(sheets) },
  }
}
