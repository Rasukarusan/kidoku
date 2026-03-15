// MeiliSearch seed script - indexes book data from the database into MeiliSearch
// Usage: node scripts/seed-meilisearch.js
//
// Environment variables (with defaults for sandbox):
//   MEILI_HOST        - MeiliSearch host (default: http://localhost:7700)
//   MEILI_MASTER_KEY  - MeiliSearch master key (default: YourMasterKey)
//   DATABASE_URL      - MySQL connection string (default: uses Prisma default)

const path = require('path');
const { PrismaClient } = require(
  path.join(__dirname, '..', 'apps', 'web', 'node_modules', '@prisma', 'client')
);

const MEILI_HOST = process.env.MEILI_HOST || 'http://localhost:7700';
const MEILI_MASTER_KEY = process.env.MEILI_MASTER_KEY || 'YourMasterKey';
const INDEX_NAME = 'books';

async function meiliRequest(method, endpoint, body) {
  const url = `${MEILI_HOST}${endpoint}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${MEILI_MASTER_KEY}`,
    },
  };
  if (body) {
    options.body = JSON.stringify(body);
  }
  const res = await fetch(url, options);
  if (!res.ok && res.status !== 404) {
    const text = await res.text();
    throw new Error(`MeiliSearch ${method} ${endpoint} failed (${res.status}): ${text}`);
  }
  return res.json();
}

async function waitForTask(taskUid) {
  const maxWait = 30000;
  const start = Date.now();
  while (Date.now() - start < maxWait) {
    const task = await meiliRequest('GET', `/tasks/${taskUid}`);
    if (task.status === 'succeeded') return task;
    if (task.status === 'failed') {
      throw new Error(`MeiliSearch task ${taskUid} failed: ${JSON.stringify(task.error)}`);
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`MeiliSearch task ${taskUid} timed out`);
}

async function main() {
  console.log('Seeding MeiliSearch...');
  console.log(`  Host: ${MEILI_HOST}`);

  const prisma = new PrismaClient();

  try {
    // DBから全書籍データを取得（ユーザー・シート情報含む）
    const books = await prisma.books.findMany({
      include: {
        user: { select: { name: true, image: true } },
        sheet: { select: { name: true } },
      },
    });

    if (books.length === 0) {
      console.log('No books found in database. Run database seed first.');
      console.log('  e.g. node scripts/sandbox-seed.js');
      return;
    }

    // MeiliSearch用ドキュメントに変換
    const documents = books.map((book) => ({
      id: book.id,
      title: book.title,
      author: book.author,
      image: book.image || '',
      memo: book.isPublicMemo ? (book.memo || '') : '',
      username: book.user?.name || '',
      userImage: book.user?.image || '',
      sheet: book.sheet?.name || '',
    }));

    // インデックスを削除して再作成（冪等性のため）
    try {
      const deleteTask = await meiliRequest('DELETE', `/indexes/${INDEX_NAME}`);
      if (deleteTask.taskUid != null) {
        await waitForTask(deleteTask.taskUid);
        console.log('  Deleted existing index');
      }
    } catch {
      // インデックスが存在しない場合は無視
    }

    // インデックス作成
    const createTask = await meiliRequest('POST', '/indexes', {
      uid: INDEX_NAME,
      primaryKey: 'id',
    });
    await waitForTask(createTask.taskUid);
    console.log('  Created index: ' + INDEX_NAME);

    // 検索可能属性の設定
    const settingsTask = await meiliRequest(
      'PATCH',
      `/indexes/${INDEX_NAME}/settings`,
      {
        searchableAttributes: ['title', 'author', 'memo', 'username', 'sheet'],
        displayedAttributes: ['id', 'title', 'author', 'image', 'memo', 'username', 'userImage', 'sheet'],
      }
    );
    await waitForTask(settingsTask.taskUid);
    console.log('  Configured searchable attributes');

    // ドキュメント登録
    const addTask = await meiliRequest('POST', `/indexes/${INDEX_NAME}/documents`, documents);
    await waitForTask(addTask.taskUid);
    console.log(`  Indexed ${documents.length} books`);

    // 確認
    const stats = await meiliRequest('GET', `/indexes/${INDEX_NAME}/stats`);
    console.log(`\nMeiliSearch seed completed! (${stats.numberOfDocuments} documents indexed)`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error('MeiliSearch seed error:', e);
  process.exit(1);
});
