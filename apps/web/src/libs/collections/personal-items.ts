import type { Prisma } from '@prisma/client'
import prisma from '@/libs/prisma'
import type { Pagination } from '@/utils/pagination'

export async function listPersonalItems(
  userId: string,
  { page, perPage }: Pagination,
  filter: { query?: string; itemTypeId?: string; collectionId?: number } = {}
) {
  const where: Prisma.ItemWhereInput = {
    userId,
    ...(filter.query ? { title: { contains: filter.query } } : {}),
    ...(filter.itemTypeId ? { itemTypeId: filter.itemTypeId } : {}),
    ...(filter.collectionId
      ? { collections: { some: { collectionId: filter.collectionId } } }
      : {}),
  }
  const [total, items] = await prisma.$transaction([
    prisma.item.count({ where }),
    prisma.item.findMany({
      where,
      select: {
        id: true,
        itemTypeId: true,
        title: true,
        imageUrl: true,
        category: true,
        rating: true,
        attributes: true,
        attributesVersion: true,
        createdAt: true,
        updatedAt: true,
        collections: { select: { collectionId: true } },
      },
      orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }],
      skip: (page - 1) * perPage,
      take: perPage,
    }),
  ])
  return {
    total,
    page,
    perPage,
    totalPages: Math.ceil(total / perPage),
    items: items.map(({ collections, ...item }) => ({
      ...item,
      collectionIds: collections.map((link) => link.collectionId),
    })),
  }
}

export async function getPersonalItem(userId: string, id: number) {
  const item = await prisma.item.findFirst({
    where: { userId, id },
    include: {
      collections: { select: { collectionId: true } },
      logs: { orderBy: [{ occurredAt: 'desc' }, { id: 'desc' }] },
    },
  })
  if (!item) return null
  const { collections, ...values } = item
  return {
    ...values,
    collectionIds: collections.map((link) => link.collectionId),
  }
}

export async function listPersonalCollections(userId: string) {
  return (
    await prisma.collection.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        description: true,
        _count: { select: { items: true } },
      },
      orderBy: [{ position: 'asc' }, { id: 'asc' }],
    })
  ).map(({ _count, ...collection }) => ({
    ...collection,
    itemCount: _count.items,
  }))
}
