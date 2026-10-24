import { BookRepository } from './book';
import { Book } from '../../domain/models/book';
import { PrismaService } from '../database/prisma.service';

it('preserves multiple authors and memberships during legacy memo edits', async () => {
  const tx = {
    item: {
      findFirst: jest.fn().mockResolvedValue({
        id: 99,
        userId: 'owner',
        itemTypeId: 'book',
        attributes: { authors: ['著者A', '著者B'], isbn: '123' },
        collections: [{ collectionId: 10 }, { collectionId: 20 }],
      }),
      update: jest.fn().mockResolvedValue({ id: 99 }),
    },
    collection: {
      findFirst: jest.fn().mockResolvedValue({ id: 20, userId: 'owner' }),
    },
    collectionItem: { upsert: jest.fn(), deleteMany: jest.fn() },
    collectionHighlight: { deleteMany: jest.fn() },
    itemLog: {
      findFirst: jest.fn().mockResolvedValue(null),
      create: jest.fn(),
    },
  };
  const prisma = {
    $transaction: jest.fn((run: (value: typeof tx) => unknown) => run(tx)),
  };
  const repository = new BookRepository(prisma as unknown as PrismaService);
  const book = Book.fromDatabase(
    '99',
    'owner',
    20,
    '本',
    '著者A',
    '小説',
    '',
    '-',
    '更新したメモ',
    false,
    false,
    null,
    new Date(),
    new Date(),
  );
  await repository.save(book);
  expect(tx.item.update.mock.calls[0][0]).toMatchObject({
    data: {
      attributes: { authors: ['著者A', '著者B'], isbn: '123' },
      memo: '更新したメモ',
    },
  });
  expect(tx.collectionItem.deleteMany).not.toHaveBeenCalled();
});
