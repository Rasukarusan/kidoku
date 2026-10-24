import { deleteOwnedItems } from '../database/delete-owned-items';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import {
  ICollectionRepository,
  ItemFilter,
} from '../../domain/repositories/collection';
import {
  Attributes,
  ItemData,
  ItemTypeDefinition,
  SaveItemInput,
  SaveLogInput,
} from '../../domain/models/item';

const itemInclude = {
  collections: true,
  logs: { orderBy: [{ occurredAt: 'desc' }, { id: 'desc' }] },
} satisfies Prisma.ItemInclude;
type Row = Prisma.ItemGetPayload<{ include: typeof itemInclude }>;
const toItem = (row: Row): ItemData => ({
  ...row,
  attributes: row.attributes as Attributes,
  collectionIds: row.collections.map((link) => link.collectionId),
});

@Injectable()
export class CollectionRepository implements ICollectionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async types() {
    return (
      await this.prisma.itemType.findMany({ orderBy: { key: 'asc' } })
    ).map((type) => ({
      ...type,
      definition: type.definition as unknown as ItemTypeDefinition,
    }));
  }
  async collections(userId: string) {
    return (
      await this.prisma.collection.findMany({
        where: { userId },
        orderBy: [{ position: 'asc' }, { id: 'asc' }],
        include: {
          _count: { select: { items: true } },
          highlights: { select: { itemId: true, position: true } },
        },
      })
    ).map((row) => ({ ...row, itemCount: row._count.items }));
  }
  async saveCollection(
    userId: string,
    input: { id?: number; name: string; description: string },
  ) {
    const row = input.id
      ? await this.prisma.collection.update({
          where: { id: input.id, userId },
          data: { name: input.name, description: input.description },
          include: {
            _count: { select: { items: true } },
            highlights: { select: { itemId: true, position: true } },
          },
        })
      : await this.prisma.collection.create({
          data: { userId, name: input.name, description: input.description },
          include: {
            _count: { select: { items: true } },
            highlights: { select: { itemId: true, position: true } },
          },
        });
    return { ...row, itemCount: row._count.items };
  }
  async deleteCollection(userId: string, id: number) {
    await this.prisma.$transaction(
      async (tx) => {
        if (!(await tx.collection.findFirst({ where: { id, userId } })))
          throw new NotFoundException('コレクションが見つかりません');
        // Deleting a collection only unlinks items. It never deletes the items.
        await tx.collectionItem.deleteMany({ where: { collectionId: id } });
        await tx.collectionHighlight.deleteMany({
          where: { collectionId: id },
        });
        await tx.aiSummaries.deleteMany({ where: { userId, sheetId: id } });
        await tx.collection.delete({ where: { id, userId } });
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }
  async setHighlight(
    userId: string,
    collectionId: number,
    position: number,
    itemId: number | null,
  ) {
    await this.prisma.$transaction(
      async (tx) => {
        if (
          !(await tx.collection.findFirst({
            where: { id: collectionId, userId },
          }))
        )
          throw new NotFoundException('コレクションが見つかりません');
        if (itemId === null) {
          await tx.collectionHighlight.deleteMany({
            where: { collectionId, position },
          });
          return;
        }
        if (
          !(await tx.item.findFirst({
            where: {
              id: itemId,
              userId,
              collections: { some: { collectionId } },
            },
          }))
        )
          throw new NotFoundException(
            'コレクション内のアイテムが見つかりません',
          );
        await tx.collectionHighlight.upsert({
          where: { collectionId_position: { collectionId, position } },
          create: { collectionId, position, itemId },
          update: { itemId },
        });
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }

  async items(userId: string, filter: ItemFilter) {
    const rows = await this.prisma.item.findMany({
      where: {
        userId,
        ...(filter.collectionId
          ? { collections: { some: { collectionId: filter.collectionId } } }
          : {}),
        ...(filter.itemTypeId ? { itemTypeId: filter.itemTypeId } : {}),
        ...(filter.query ? { title: { contains: filter.query } } : {}),
        ...(filter.from || filter.to
          ? {
              logs: {
                some: {
                  occurredAt: {
                    ...(filter.from ? { gte: filter.from } : {}),
                    ...(filter.to ? { lt: filter.to } : {}),
                  },
                },
              },
            }
          : {}),
      },
      include: itemInclude,
      orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }],
    });
    return rows.map(toItem);
  }
  async item(userId: string, id: number) {
    const row = await this.prisma.item.findFirst({
      where: { id, userId },
      include: itemInclude,
    });
    return row ? toItem(row) : null;
  }
  async saveItem(
    userId: string,
    id: number | undefined,
    input: SaveItemInput,
    version: number,
    initialLog?: SaveLogInput,
  ) {
    return this.prisma.$transaction(
      async (tx) => {
        if (
          id &&
          !(await tx.item.findFirst({
            where: { id, userId, itemTypeId: input.itemTypeId },
          }))
        )
          throw new NotFoundException('アイテムが見つかりません');
        const ownedCount = await tx.collection.count({
          where: { id: { in: input.collectionIds }, userId },
        });
        if (ownedCount !== input.collectionIds.length)
          throw new NotFoundException('コレクションが見つかりません');
        const { collectionIds, ...values } = input;
        const data = {
          ...values,
          attributes: values.attributes as Prisma.InputJsonObject,
          attributesVersion: version,
        };
        const row = id
          ? await tx.item.update({ where: { id, userId }, data })
          : await tx.item.create({ data: { ...data, userId } });
        // Keep highlights consistent when an item leaves a collection.
        await tx.collectionHighlight.deleteMany({
          where: { itemId: row.id, collectionId: { notIn: collectionIds } },
        });
        await tx.collectionItem.deleteMany({
          where: { itemId: row.id, collectionId: { notIn: collectionIds } },
        });
        if (collectionIds.length)
          await tx.collectionItem.createMany({
            data: collectionIds.map((collectionId) => ({
              collectionId,
              itemId: row.id,
            })),
            skipDuplicates: true,
          });
        if (initialLog)
          await tx.itemLog.create({ data: { ...initialLog, itemId: row.id } });
        return toItem(
          await tx.item.findUniqueOrThrow({
            where: { id: row.id },
            include: itemInclude,
          }),
        );
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }
  async deleteItem(userId: string, id: number) {
    await this.prisma.$transaction(
      async (tx) => {
        if (!(await tx.item.findFirst({ where: { id, userId } })))
          throw new NotFoundException('アイテムが見つかりません');
        await deleteOwnedItems(tx, userId, [id]);
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }
  async saveLog(
    userId: string,
    itemId: number,
    id: number | undefined,
    input: SaveLogInput,
  ) {
    return this.prisma.$transaction(
      async (tx) => {
        if (!(await tx.item.findFirst({ where: { id: itemId, userId } })))
          throw new NotFoundException('アイテムが見つかりません');
        return id
          ? tx.itemLog.update({ where: { id, itemId }, data: input })
          : tx.itemLog.create({ data: { ...input, itemId } });
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }
  async deleteLog(userId: string, itemId: number, id: number) {
    await this.prisma.$transaction(
      async (tx) => {
        if (!(await tx.item.findFirst({ where: { id: itemId, userId } })))
          throw new NotFoundException('アイテムが見つかりません');
        await tx.itemLog.delete({ where: { id, itemId } });
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }
}
