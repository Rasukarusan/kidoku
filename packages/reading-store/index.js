const { Prisma } = require("@prisma/client");

const bookSource = Prisma.sql`
  SELECT i.id, i.user_id AS userId,
    (SELECT MIN(ci.collection_id) FROM collection_items ci WHERE ci.item_id = i.id) AS sheetId,
    i.title, COALESCE(JSON_UNQUOTE(JSON_EXTRACT(i.attributes, '$.authors[0]')), '') AS author,
    i.category, i.image_url AS image, i.rating AS impression,
    i.memo, i.is_public_memo AS isPublicMemo, i.is_purchasable AS isPurchasable, i.price,
    (SELECT l.occurred_at FROM item_logs l WHERE l.item_id = i.id AND l.kind = 'read'
      ORDER BY l.created_at DESC, l.id DESC LIMIT 1) AS finished,
    i.created_at AS created, i.updated_at AS updated
  FROM items i WHERE i.item_type_id = 'book'
    AND EXISTS (SELECT 1 FROM collection_items ci WHERE ci.item_id = i.id)
`;

function bookCondition(filter = {}) {
  const conditions = [];
  for (const field of ["id", "userId", "sheetId", "isPublicMemo"]) {
    const value = filter[field];
    if (value === undefined) continue;
    const column = Prisma.raw(`b.${field}`);
    if (Array.isArray(value))
      conditions.push(
        value.length
          ? Prisma.sql`${column} IN (${Prisma.join(value)})`
          : Prisma.sql`FALSE`,
      );
    else conditions.push(Prisma.sql`${column} = ${value}`);
  }
  if (filter.finished?.not === null)
    conditions.push(Prisma.sql`b.finished IS NOT NULL`);
  if (filter.finished?.gte)
    conditions.push(Prisma.sql`b.finished >= ${filter.finished.gte}`);
  if (filter.finished?.lte)
    conditions.push(Prisma.sql`b.finished <= ${filter.finished.lte}`);
  for (const [field, values] of [
    ["category", filter.categories],
    ["author", filter.authors],
  ]) {
    if (values)
      conditions.push(
        values.length
          ? Prisma.sql`${Prisma.raw(`b.${field}`)} IN (${Prisma.join(values)})`
          : Prisma.sql`FALSE`,
      );
  }
  if (filter.search) {
    const allowed = new Set(["title", "author", "category", "memo"]);
    const fields = filter.search.fields;
    if (!fields.length || fields.some((field) => !allowed.has(field)))
      throw new Error("Invalid book search fields");
    const pattern = `%${filter.search.text}%`;
    conditions.push(
      Prisma.sql`(${Prisma.join(
        fields.map(
          (field) => Prisma.sql`${Prisma.raw(`b.${field}`)} LIKE ${pattern}`,
        ),
        " OR ",
      )})`,
    );
  }
  if (filter.followingUserId !== undefined)
    conditions.push(Prisma.sql`
    EXISTS (SELECT 1 FROM follows f WHERE f.following_id = b.userId AND f.follower_id = ${filter.followingUserId})`);
  return conditions.length
    ? Prisma.join(conditions, " AND ")
    : Prisma.sql`TRUE`;
}

async function readBooks(db, options = {}) {
  const order = Array.isArray(options.orderBy)
    ? options.orderBy
    : options.orderBy
      ? [options.orderBy]
      : [];
  const allowed = new Set(["id", "title", "finished", "created", "updated"]);
  const ordering = order.flatMap((entry) =>
    Object.entries(entry).map(([field, direction]) => {
      if (!allowed.has(field) || !["asc", "desc"].includes(direction))
        throw new Error("Invalid book ordering");
      return Prisma.raw(`b.${field} ${direction.toUpperCase()}`);
    }),
  );
  const limit = options.limit;
  const offset = options.offset ?? 0;
  if (
    (limit !== undefined && (!Number.isSafeInteger(limit) || limit < 0)) ||
    !Number.isSafeInteger(offset) ||
    offset < 0
  )
    throw new Error("Invalid book pagination");
  const rows = await db.$queryRaw(Prisma.sql`
    SELECT b.*, u.name AS userName, u.image AS userImage, c.name AS sheetName,
      (SELECT COUNT(*) FROM likes lk WHERE lk.item_id = b.id) AS likeCount
    FROM (${bookSource}) b
    JOIN users u ON u.id = b.userId JOIN collections c ON c.id = b.sheetId
    WHERE ${bookCondition(options.filter)}
    ${ordering.length ? Prisma.sql`ORDER BY ${Prisma.join(ordering)}` : Prisma.empty}
    ${limit !== undefined ? Prisma.sql`LIMIT ${limit} OFFSET ${offset}` : offset ? Prisma.sql`LIMIT 18446744073709551615 OFFSET ${offset}` : Prisma.empty}
  `);
  return rows.map(({ userName, userImage, sheetName, likeCount, ...book }) => ({
    ...book,
    id: Number(book.id),
    sheetId: Number(book.sheetId),
    isPublicMemo: Boolean(book.isPublicMemo),
    isPurchasable: Boolean(book.isPurchasable),
    user: { id: book.userId, name: userName, image: userImage },
    sheet: { id: Number(book.sheetId), name: sheetName },
    _count: { likes: Number(likeCount) },
  }));
}

async function readBook(db, filter) {
  return (await readBooks(db, { filter, limit: 1 }))[0] ?? null;
}

async function countBooks(db, filter) {
  const [row] = await db.$queryRaw(
    Prisma.sql`SELECT COUNT(*) AS total FROM (${bookSource}) b WHERE ${bookCondition(filter)}`,
  );
  return Number(row.total);
}

async function readSheets(db, options = {}) {
  const rows = await db.collection.findMany({
    where: options.where,
    orderBy: options.orderBy,
    take: options.limit,
    include: { user: { select: { name: true } } },
  });
  return rows.map(({ position, createdAt, updatedAt, ...row }) => ({
    ...row,
    order: position,
    created: createdAt,
    updated: updatedAt,
  }));
}

function firstAuthor(attributes) {
  return typeof attributes?.authors?.[0] === "string"
    ? attributes.authors[0]
    : "";
}

async function readHighlights(
  db,
  { userId, year, username, orderBy = { position: "asc" } } = {},
) {
  const rows = await db.collectionHighlight.findMany({
    where: {
      collection: {
        userId,
        name: year,
        ...(username ? { user: { name: username } } : {}),
      },
      item: { itemTypeId: "book" },
    },
    include: { collection: true, item: true },
    orderBy,
  });
  return rows.map((row) => ({
    year: row.collection.name,
    order: row.position,
    book: {
      id: row.item.id,
      title: row.item.title,
      author: firstAuthor(row.item.attributes),
      image: row.item.imageUrl,
      memo: row.item.memo,
      isPublicMemo: row.item.isPublicMemo,
    },
  }));
}

async function readTemplates(db, userId) {
  const rows = await db.itemTemplate.findMany({
    where: { userId, itemTypeId: "book" },
    orderBy: { createdAt: "desc" },
  });
  return rows.map(({ imageUrl, createdAt, updatedAt, attributes, ...row }) => ({
    ...row,
    author: firstAuthor(attributes),
    image: imageUrl,
    created: createdAt,
    updated: updatedAt,
  }));
}

async function readLibrary(db, userId) {
  const [sheets, books] = await Promise.all([
    readSheets(db, { where: { userId }, orderBy: { position: "asc" } }),
    readBooks(db, { filter: { userId }, orderBy: { finished: "desc" } }),
  ]);
  return sheets.map((sheet) => ({
    ...sheet,
    books: books.filter((book) => book.sheetId === sheet.id),
  }));
}

module.exports = {
  readBooks,
  readBook,
  countBooks,
  readSheets,
  readHighlights,
  readTemplates,
  readLibrary,
};
