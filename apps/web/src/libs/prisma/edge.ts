import { PrismaClient } from '@prisma/client/edge'
const prisma = new PrismaClient({
  log: [
    // 'query',
    // 'info',
    'warn',
    'error',
  ],
})
export default prisma

export * from '@prisma/client/edge'
