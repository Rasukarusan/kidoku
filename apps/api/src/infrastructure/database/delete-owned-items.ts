import { Prisma } from '@prisma/client';

/** Delete dependent rows explicitly: compatibility views are never write targets. */
export async function deleteOwnedItems(
  tx: Prisma.TransactionClient,
  userId: string,
  ids: number[],
) {
  const owned = await tx.item.findMany({
    where: { userId, id: { in: ids } },
    select: { id: true },
  });
  const itemIds = owned.map((item) => item.id);
  const where = { bookId: { in: itemIds } };
  await tx.like.deleteMany({ where });
  await tx.purchase.deleteMany({ where });
  await tx.bookComment.deleteMany({ where });
  await tx.notification.deleteMany({ where });
  await tx.collectionHighlight.deleteMany({
    where: { itemId: { in: itemIds } },
  });
  await tx.collectionItem.deleteMany({ where: { itemId: { in: itemIds } } });
  await tx.itemLog.deleteMany({ where: { itemId: { in: itemIds } } });
  await tx.item.deleteMany({ where: { userId, id: { in: itemIds } } });
}
