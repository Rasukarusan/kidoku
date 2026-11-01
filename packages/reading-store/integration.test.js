const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const { PrismaClient } = require("@prisma/client");
const {
  readBooks,
  readBook,
  countBooks,
  readLibrary,
  readHighlights,
  readTemplates,
} = require("./index");

const db = new PrismaClient();
const prefix = `view-free-${Date.now()}`;
const owner = `${prefix}-owner`;
const other = `${prefix}-other`;
let first, second, book, unfinished, movie;

before(async () => {
  const views =
    await db.$queryRaw`SELECT TABLE_NAME FROM information_schema.VIEWS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME LIKE 'legacy_%'`;
  assert.equal(views.length, 0, "Run against a database without legacy views");
  await db.user.createMany({
    data: [
      { id: owner, name: owner },
      { id: other, name: other },
    ],
  });
  first = await db.collection.create({
    data: { userId: owner, name: "2025", position: 1, description: "" },
  });
  second = await db.collection.create({
    data: { userId: owner, name: "2026", position: 2, description: "" },
  });
  book = await db.item.create({
    data: {
      userId: owner,
      itemTypeId: "book",
      title: "100%_! ' OR 1=1 --",
      attributes: { authors: ["著者一", "著者二"] },
      category: "技術",
      rating: "◎",
      memo: "非公開メモ",
      isPublicMemo: true,
      collections: {
        create: [{ collectionId: second.id }, { collectionId: first.id }],
      },
      logs: {
        create: [
          {
            kind: "read",
            occurredAt: new Date("2030-01-01Z"),
            createdAt: new Date("2025-01-01Z"),
            memo: "",
          },
          {
            kind: "read",
            occurredAt: new Date("2020-01-01Z"),
            createdAt: new Date("2025-02-01Z"),
            memo: "",
          },
          {
            kind: "watch",
            occurredAt: new Date("2040-01-01Z"),
            createdAt: new Date("2025-03-01Z"),
            memo: "",
          },
        ],
      },
    },
  });
  unfinished = await db.item.create({
    data: {
      userId: owner,
      itemTypeId: "book",
      title: "未読",
      attributes: {},
      memo: "",
      collections: { create: { collectionId: second.id } },
      logs: {
        create: [
          {
            kind: "read",
            occurredAt: new Date("2024-01-01Z"),
            createdAt: new Date("2025-01-01Z"),
            memo: "",
          },
          {
            kind: "read",
            occurredAt: null,
            createdAt: new Date("2025-01-01Z"),
            memo: "",
          },
        ],
      },
    },
  });
  movie = await db.item.create({
    data: {
      userId: owner,
      itemTypeId: "movie",
      title: "映画",
      attributes: { directors: ["監督"] },
      memo: "",
      collections: { create: { collectionId: first.id } },
    },
  });
  await db.item.create({
    data: {
      userId: owner,
      itemTypeId: "book",
      title: "未所属",
      attributes: {},
      memo: "",
    },
  });
  await db.item.create({
    data: {
      userId: other,
      itemTypeId: "book",
      title: "他人の本",
      attributes: {},
      memo: "秘密",
    },
  });
  await db.like.create({ data: { userId: other, bookId: book.id } });
  await db.bookComment.create({
    data: { userId: other, bookId: book.id, content: "コメント" },
  });
  await db.follow.create({ data: { followerId: other, followingId: owner } });
  await db.collectionHighlight.createMany({
    data: [
      { collectionId: first.id, itemId: book.id, position: 1 },
      { collectionId: first.id, itemId: movie.id, position: 2 },
    ],
  });
  await db.itemTemplate.createMany({
    data: [
      {
        userId: owner,
        itemTypeId: "book",
        name: "本",
        category: "",
        isPublicMemo: false,
        title: "本",
        attributes: { authors: ["著者一", "著者二"] },
        imageUrl: "/book.png",
        memo: "",
      },
      {
        userId: owner,
        itemTypeId: "movie",
        name: "映画",
        category: "",
        isPublicMemo: false,
        title: "映画",
        attributes: {},
        imageUrl: "/movie.png",
        memo: "",
      },
    ],
  });
});

after(async () => {
  const ids = (
    await db.item.findMany({
      where: { userId: { in: [owner, other] } },
      select: { id: true },
    })
  ).map((row) => row.id);
  await db.bookComment.deleteMany({ where: { bookId: { in: ids } } });
  await db.like.deleteMany({ where: { bookId: { in: ids } } });
  await db.item.deleteMany({ where: { userId: { in: [owner, other] } } });
  await db.user.deleteMany({ where: { id: { in: [owner, other] } } });
  await db.$disconnect();
});

test("汎用データから本だけを重複なく投影し、最新の読書履歴を使う", async () => {
  const rows = await readBooks(db, {
    filter: { userId: owner },
    orderBy: [{ finished: "desc" }, { id: "desc" }],
  });
  assert.deepEqual(
    rows.map((row) => row.id),
    [book.id, unfinished.id],
  );
  assert.equal(rows[0].sheetId, first.id);
  assert.equal(rows[0].author, "著者一");
  assert.equal(rows[0].finished.toISOString(), "2020-01-01T00:00:00.000Z");
  assert.equal(rows[0]._count.likes, 1);
  assert.equal(rows[1].author, "");
  assert.equal(rows[1].finished, null);
  assert.equal(await countBooks(db, { userId: owner }), 2);
  assert.equal(await readBook(db, { userId: other, id: book.id }), null);
  assert.equal(await readBook(db, { id: movie.id }), null);
});

test("フィルターとページングをDBで適用し、検索値をSQLとして解釈しない", async () => {
  const filter = {
    userId: owner,
    finished: {
      not: null,
      gte: new Date("2019-01-01Z"),
      lte: new Date("2021-01-01Z"),
    },
    authors: ["著者一"],
    categories: ["技術"],
  };
  assert.equal(await countBooks(db, filter), 1);
  assert.equal((await readBooks(db, { filter, limit: 1 }))[0].id, book.id);
  assert.deepEqual(await readBooks(db, { filter, offset: 1, limit: 1 }), []);
  assert.equal(
    await countBooks(db, {
      userId: owner,
      search: { text: "%_! ' OR 1=1 --", fields: ["title"] },
    }),
    1,
  );
  assert.equal(await countBooks(db, { userId: owner, id: [] }), 0);
  assert.equal(
    await countBooks(db, { followingUserId: other, isPublicMemo: true }),
    1,
  );
  assert.equal(await countBooks(db, { userId: owner, sheetId: second.id }), 1);
  assert.equal(await countBooks(db, { userId: owner, authors: ["著者二"] }), 0);
});

test("シート・ランキング・テンプレートとコメントの関連がビューなしで取得できる", async () => {
  const library = await readLibrary(db, owner);
  assert.deepEqual(
    library.map((row) => [row.name, row.books.length]),
    [
      ["2025", 1],
      ["2026", 1],
    ],
  );
  const highlights = await readHighlights(db, { userId: owner, year: "2025" });
  assert.equal(highlights.length, 1);
  assert.equal(highlights[0].book.id, book.id);
  assert.equal((await readHighlights(db, { userId: other })).length, 0);
  const templates = await readTemplates(db, owner);
  assert.equal(templates.length, 1);
  assert.equal(templates[0].author, "著者一");
  const comment = await db.bookComment.findFirst({
    where: { bookId: book.id },
    include: { book: true },
  });
  assert.equal(comment.book.userId, owner);
  assert.equal(
    await db.item.count({ where: { userId: owner, itemTypeId: "movie" } }),
    1,
  );
});
