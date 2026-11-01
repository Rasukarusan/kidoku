import { strict as assert } from 'node:assert';
import { randomUUID } from 'node:crypto';
import { after, before, test } from 'node:test';
import { setTimeout as delay } from 'node:timers/promises';
import { MeiliSearch } from 'meilisearch';
import { DeleteBookUseCase } from '../src/application/usecases/books/delete-book';
import { ManageCollectionsUseCase } from '../src/application/usecases/collections/manage-collections';
import { PrismaService } from '../src/infrastructure/database/prisma.service';
import { BookRepository } from '../src/infrastructure/repositories/book';
import { CollectionRepository } from '../src/infrastructure/repositories/collection';
import { SearchRepository } from '../src/infrastructure/repositories/search';
import { UserRepository } from '../src/infrastructure/repositories/user';

if (!new URL(process.env.DATABASE_URL ?? '').pathname.endsWith('_test'))
  throw new Error(
    'Transaction integration tests require a dedicated _test database',
  );

const db = new PrismaService();
const repository = new CollectionRepository(db);
const users = new UserRepository(db);
const searchClient = new MeiliSearch({
  host: process.env.MEILI_HOST!,
  apiKey: process.env.MEILI_MASTER_KEY,
});
const search = new SearchRepository(searchClient);
const owner = randomUUID();
const input = {
  itemTypeId: 'book',
  title: 'トランザクション検証',
  attributes: { authors: ['著者'] },
  category: '',
  imageUrl: '/no-image.png',
  rating: '-',
  memo: '',
  isPublicMemo: false,
  collectionIds: [] as number[],
};

before(async () => {
  await db.$connect();
  await db.user.create({ data: { id: owner, name: `transaction-${owner}` } });
});

after(async () => {
  try {
    await users.delete(owner);
    assert.equal(await db.user.count({ where: { id: owner } }), 0);
  } finally {
    await db.$disconnect();
  }
});

void test('registration commits before indexing, and book/log/collection changes commit', async () => {
  const collection = await repository.saveCollection(owner, {
    name: `本棚-${randomUUID()}`,
    description: '',
  });
  const useCase = new ManageCollectionsUseCase(repository, search, users);
  const saved = await useCase.saveItem(
    owner,
    undefined,
    { ...input, collectionIds: [collection.id] },
    {
      kind: 'read',
      occurredAt: new Date('2026-01-01'),
      memo: '',
      rating: null,
    },
  );
  const tasks = await searchClient.getTasks({ indexUids: ['books'], limit: 1 });
  assert.ok(tasks.results[0]);
  const indexed = await searchClient.waitForTask(tasks.results[0].uid);
  assert.equal(indexed.status, 'succeeded');
  const index = searchClient.index('books');
  const document = await index.getDocument(String(saved.id));
  assert.equal(document.id, String(saved.id));
  assert.equal(document.image, input.imageUrl);
  assert.equal(document.memo, '');
  const results = await index.search(input.title);
  assert.ok(results.hits.some((hit) => String(hit.id) === String(saved.id)));
  assert.equal(saved.logs.length, 1);

  const books = new BookRepository(db);
  const book = await books.findById(String(saved.id));
  assert.ok(book);
  book.update({ memo: '編集済み' });
  await books.save(book);
  assert.equal((await books.findById(String(saved.id)))?.memo, '編集済み');

  await repository.setHighlight(owner, collection.id, 1, saved.id);
  const log = await repository.saveLog(owner, saved.id, undefined, {
    kind: 'read',
    occurredAt: null,
    memo: '再読',
    rating: null,
  });
  await repository.saveLog(owner, saved.id, log.id, {
    kind: 'read',
    occurredAt: null,
    memo: '再読の追記',
    rating: null,
  });
  await repository.deleteLog(owner, saved.id, log.id);
  await repository.deleteCollection(owner, collection.id);
  assert.ok(await repository.item(owner, saved.id));
  assert.equal(
    await db.collectionItem.count({ where: { itemId: saved.id } }),
    0,
  );
  await new DeleteBookUseCase(books, search).execute(owner, String(saved.id));
  assert.equal(await repository.item(owner, saved.id), null);
  assert.equal(await db.itemLog.count({ where: { itemId: saved.id } }), 0);
  assert.equal((await index.search(input.title)).hits.length, 0);
});

void test('a failed initial log rolls back the item and its membership', async () => {
  const collection = await repository.saveCollection(owner, {
    name: `失敗検証-${randomUUID()}`,
    description: '',
  });
  const title = randomUUID();
  await assert.rejects(
    repository.saveItem(
      owner,
      undefined,
      { ...input, title, collectionIds: [collection.id] },
      1,
      { kind: 'read', occurredAt: new Date(NaN), memo: '', rating: null },
    ),
  );
  assert.equal(await db.item.count({ where: { userId: owner, title } }), 0);
  assert.equal(
    await db.collectionItem.count({ where: { collectionId: collection.id } }),
    0,
  );
});

void test('registration waits for a concurrent collection deletion and rejects the deleted collection', async () => {
  const collection = await repository.saveCollection(owner, {
    name: `競合検証-${randomUUID()}`,
    description: '',
  });
  let release!: () => void;
  let started!: () => void;
  const paused = new Promise<void>((resolve) => {
    release = resolve;
  });
  const deleting = new Promise<void>((resolve) => {
    started = resolve;
  });
  const deletion = db.transactionForUser(owner, async (tx) => {
    await tx.collection.delete({ where: { id: collection.id } });
    started();
    await paused;
  });
  await deleting;
  const title = randomUUID();
  const registration = repository
    .saveItem(
      owner,
      undefined,
      { ...input, title, collectionIds: [collection.id] },
      1,
    )
    .then(
      () => 'saved',
      (error: Error) => error,
    );
  try {
    assert.equal(
      await Promise.race([registration, delay(150, 'waiting')]),
      'waiting',
    );
  } finally {
    release();
    await deletion;
  }
  const result = await registration;
  assert.ok(result instanceof Error);
  assert.match(result.message, /コレクションが見つかりません/);
  assert.equal(await db.item.count({ where: { userId: owner, title } }), 0);
});
