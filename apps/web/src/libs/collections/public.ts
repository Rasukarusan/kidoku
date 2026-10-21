import prisma, { parse } from '@/libs/prisma'
import { mask } from '@/utils/string'

const publicInclude = {
  collections: { select: { collectionId: true } },
  logs: {
    select: { id: true, itemId: true, kind: true, occurredAt: true },
    orderBy: [{ occurredAt: 'desc' as const }, { id: 'desc' as const }],
  },
}

function publicItem(row) {
  return {
    ...row,
    memo: row.isPublicMemo ? mask(row.memo) : '',
    collectionIds: row.collections.map((link) => link.collectionId),
    collections: undefined,
    logs: row.logs.map((log) => ({ ...log, memo: '', rating: null })),
  }
}

export async function publicWorkspace(username: string) {
  const user = await prisma.user.findUnique({
    where: { name: username },
    select: { id: true, name: true },
  })
  if (!user) return null
  const [collections, items, types] = await Promise.all([
    prisma.collection.findMany({
      where: { userId: user.id },
      include: {
        _count: { select: { items: true } },
        highlights: { select: { itemId: true, position: true } },
      },
      orderBy: [{ position: 'asc' }, { id: 'asc' }],
    }),
    prisma.item.findMany({
      where: { userId: user.id },
      include: publicInclude,
      orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }],
    }),
    prisma.itemType.findMany({ orderBy: { key: 'asc' } }),
  ])
  return parse({
    user,
    collections: collections.map((collection) => ({
      ...collection,
      itemCount: collection._count.items,
    })),
    items: items.map(publicItem),
    types,
  })
}

export async function publicItemPage(id: number) {
  const row = await prisma.item.findUnique({
    where: { id },
    include: { ...publicInclude, user: { select: { id: true, name: true } } },
  })
  if (!row) return null
  const likeCount = await prisma.like.count({ where: { bookId: id } })
  const types = await prisma.itemType.findMany()
  const collections = await prisma.collection.findMany({
    where: { userId: row.userId, items: { some: { itemId: id } } },
    include: {
      _count: { select: { items: true } },
      highlights: { select: { itemId: true, position: true } },
    },
  })
  return parse({
    item: { ...publicItem(row), likeCount },
    user: row.user,
    types,
    collections: collections.map((collection) => ({
      ...collection,
      itemCount: collection._count.items,
    })),
  })
}
