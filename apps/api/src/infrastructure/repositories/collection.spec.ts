import { CollectionRepository } from './collection';
import { PrismaService } from '../database/prisma.service';

function setup() {
  const tx = {
    collection: { count: jest.fn(), findFirst: jest.fn(), delete: jest.fn() },
    item: {
      findFirst: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
    itemLog: { update: jest.fn(), create: jest.fn(), delete: jest.fn() },
    collectionItem: { deleteMany: jest.fn() },
    collectionHighlight: { deleteMany: jest.fn(), upsert: jest.fn() },
    aiSummaries: { deleteMany: jest.fn() },
  };
  const prisma = {
    $transaction: jest.fn((run: (value: typeof tx) => unknown) => run(tx)),
  };
  return {
    tx,
    repository: new CollectionRepository(prisma as unknown as PrismaService),
  };
}

describe('collection ownership and lifecycle', () => {
  it('cannot highlight an item that is outside the owned collection', async () => {
    const { tx, repository } = setup();
    tx.collection.findFirst.mockResolvedValue({ id: 10, userId: 'owner' });
    tx.item.findFirst.mockResolvedValue(null);
    await expect(repository.setHighlight('owner', 10, 1, 99)).rejects.toThrow(
      'アイテムが見つかりません',
    );
    expect(tx.collectionHighlight.upsert).not.toHaveBeenCalled();
  });
  it('rejects membership in another user collection before writing an item', async () => {
    const { tx, repository } = setup();
    tx.collection.count.mockResolvedValue(1);
    await expect(
      repository.saveItem(
        'owner',
        undefined,
        {
          itemTypeId: 'movie',
          title: '映画',
          imageUrl: '',
          category: '',
          rating: '-',
          memo: '',
          isPublicMemo: false,
          attributes: {},
          collectionIds: [10, 20],
        },
        1,
      ),
    ).rejects.toThrow('コレクションが見つかりません');
    expect(tx.item.create).not.toHaveBeenCalled();
  });
  it('deleting a collection unlinks membership without deleting its items or histories', async () => {
    const { tx, repository } = setup();
    tx.collection.findFirst.mockResolvedValue({ id: 10, userId: 'owner' });
    await repository.deleteCollection('owner', 10);
    expect(tx.collectionItem.deleteMany).toHaveBeenCalledWith({
      where: { collectionId: 10 },
    });
    expect(tx.collection.delete).toHaveBeenCalledWith({
      where: { id: 10, userId: 'owner' },
    });
    expect(tx.item.delete).not.toHaveBeenCalled();
    expect(tx.itemLog.delete).not.toHaveBeenCalled();
  });
  it('does not let another user remove a collection', async () => {
    const { tx, repository } = setup();
    tx.collection.findFirst.mockResolvedValue(null);
    await expect(repository.deleteCollection('intruder', 10)).rejects.toThrow();
    expect(tx.collectionItem.deleteMany).not.toHaveBeenCalled();
  });
  it('checks the item owner before editing any log', async () => {
    const { tx, repository } = setup();
    tx.item.findFirst.mockResolvedValue(null);
    await expect(
      repository.saveLog('intruder', 10, 99, {
        kind: 'watched',
        occurredAt: null,
        memo: 'changed',
        rating: null,
      }),
    ).rejects.toThrow();
    expect(tx.itemLog.update).not.toHaveBeenCalled();
  });
  it('scopes an edited log to the requested item as well as its own ID', async () => {
    const { tx, repository } = setup();
    tx.item.findFirst.mockResolvedValue({ id: 10, userId: 'owner' });
    const input = { kind: 'watched', occurredAt: null, memo: '', rating: null };
    await repository.saveLog('owner', 10, 99, input);
    expect(tx.itemLog.update).toHaveBeenCalledWith({
      where: { id: 99, itemId: 10 },
      data: input,
    });
  });
});
