import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient({
  log: [
    // 'query',
    // 'info',
    'warn',
    'error',
  ],
})
export default prisma

export * from '@prisma/client'

/**
 * Next.jsの問題で、DATE型を含むレコードをPropsとして渡すと下記のエラーになるため、一度stringに戻す必要がある。
 * Reason: `object` ("[object Date]") cannot be serialized as JSON. Please only return JSON serializable data types.
 */
export const parse = (value) => {
  if (!value) return null
  return JSON.parse(JSON.stringify(value))
}
