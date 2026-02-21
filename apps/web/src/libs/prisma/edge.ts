import { PrismaClient } from '@kidoku/database/edge'
const prisma = new PrismaClient({
  log: [
    // 'query',
    // 'info',
    'warn',
    'error',
  ],
})
export default prisma

export * from '@kidoku/database/edge'
