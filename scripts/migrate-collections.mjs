import { createRequire } from "node:module";
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const require = createRequire(
  new URL("../apps/web/package.json", import.meta.url),
);
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const apply = process.argv.includes("--apply");
const resume = process.argv.includes("--resume-after-backfill");
const booksTable = resume ? "items" : "books";
const sheetsTable = resume ? "collections" : "sheets";
const highlightsTable = resume ? "collection_highlights" : "yearly_top_books";
const sql = await readFile(
  new URL("../docs/sql/collection-model.sql", import.meta.url),
  "utf8",
);

try {
  const tables = await prisma.$queryRawUnsafe(
    "SELECT TABLE_NAME AS name FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE()",
  );
  const names = new Set(tables.map((row) => row.name));
  if (
    !resume &&
    [
      "items",
      "collections",
      "item_types",
      "collection_items",
      "item_logs",
      "item_templates",
      "collection_highlights",
      "item_comments",
      "legacy_books",
      "legacy_sheets",
      "legacy_template_books",
      "legacy_collection_highlights",
    ].some((name) => names.has(name))
  )
    throw new Error(
      "Canonical tables already exist. Do not rerun a partial migration; inspect the ledger and restore the backup.",
    );
  for (const name of [
    booksTable,
    sheetsTable,
    resume ? "item_templates" : "template_books",
    highlightsTable,
    resume ? "item_comments" : "book_comments",
    "likes",
    "purchases",
    "notifications",
    "ai_summaries",
    "mcp_grants",
  ]) {
    if (!names.has(name)) throw new Error(`Missing legacy table: ${name}`);
  }
  if (resume) {
    for (const name of ["books", "sheets", "legacy_books", "legacy_sheets"])
      if (names.has(name))
        throw new Error("Unexpected migration state; inspect before resuming");
    const expectedColumns = {
      items:
        "id,user_id,sheet_id,title,author,category,image,impression,memo,is_public_memo,is_purchasable,price,finished,created,updated,item_type_id,attributes,attributes_version",
      collections: "id,user_id,name,position,created_at,updated_at,description",
      collection_highlights:
        "id,user_id,book_id,order,year,created,updated,collection_id",
      item_templates:
        "id,user_id,name,title,author,category,image,memo,is_public_memo,created,updated",
      item_comments: "id,book_id,user_id,content,created,updated",
    };
    for (const [table, columns] of Object.entries(expectedColumns)) {
      const actual = await prisma.$queryRawUnsafe(
        "SELECT COLUMN_NAME AS name FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? ORDER BY ORDINAL_POSITION",
        table,
      );
      if (actual.map((column) => column.name).join(",") !== columns)
        throw new Error(`Unexpected column state in ${table}; do not resume`);
    }
    const [{ count: invalidItems }] = await prisma.$queryRawUnsafe(
      "SELECT COUNT(*) AS count FROM items WHERE item_type_id <> 'book' OR attributes_version <> 1 OR NOT (attributes <=> JSON_OBJECT('authors', JSON_ARRAY(author)))",
    );
    const [{ count: invalidMemberships }] = await prisma.$queryRawUnsafe(
      "SELECT COUNT(*) AS count FROM collection_items ci LEFT JOIN items i ON i.id = ci.item_id WHERE i.id IS NULL OR ci.collection_id <> i.sheet_id OR ci.position <> 1 OR ci.added_at <> i.created",
    );
    const [{ count: missingMemberships }] = await prisma.$queryRawUnsafe(
      "SELECT COUNT(*) AS count FROM items i LEFT JOIN collection_items ci ON ci.item_id = i.id AND ci.collection_id = i.sheet_id WHERE ci.item_id IS NULL",
    );
    const [{ count: invalidLogs }] = await prisma.$queryRawUnsafe(
      "SELECT COUNT(*) AS count FROM item_logs l LEFT JOIN items i ON i.id = l.item_id WHERE i.id IS NULL OR i.finished IS NULL OR l.kind <> 'read' OR NOT (l.occurred_at <=> i.finished) OR l.memo <> '' OR l.rating IS NOT NULL OR l.created_at <> i.created OR l.updated_at <> i.updated",
    );
    const [{ count: missingLogs }] = await prisma.$queryRawUnsafe(
      "SELECT COUNT(*) AS count FROM items i WHERE i.finished IS NOT NULL AND (SELECT COUNT(*) FROM item_logs l WHERE l.item_id = i.id) <> 1",
    );
    const [{ count: changedCollections }] = await prisma.$queryRawUnsafe(
      "SELECT COUNT(*) AS count FROM collections WHERE description <> ''",
    );
    const [{ count: changedHighlights }] = await prisma.$queryRawUnsafe(
      "SELECT COUNT(*) AS count FROM collection_highlights h JOIN collections c ON c.user_id = h.user_id AND BINARY c.name = BINARY h.year WHERE NOT (h.collection_id <=> c.id)",
    );
    if (
      [
        invalidItems,
        invalidMemberships,
        missingMemberships,
        invalidLogs,
        missingLogs,
        changedCollections,
        changedHighlights,
      ].some((value) => Number(value))
    )
      throw new Error(
        "Backfilled data differs from original columns; do not resume",
      );
    console.log(
      "Partial migration schema and backfilled data verified against retained original columns",
    );
  }
  const [{ count: orphaned }] = await prisma.$queryRawUnsafe(
    `SELECT COUNT(*) AS count FROM ${booksTable} b LEFT JOIN ${sheetsTable} s ON s.id = b.sheet_id AND s.user_id = b.user_id WHERE s.id IS NULL`,
  );
  const [{ count: highlights }] = await prisma.$queryRawUnsafe(
    `SELECT COUNT(*) AS count FROM ${highlightsTable} h LEFT JOIN ${sheetsTable} s ON s.user_id = h.user_id AND BINARY s.name = BINARY h.year LEFT JOIN ${booksTable} b ON b.id = h.book_id AND b.user_id = h.user_id AND b.sheet_id = s.id WHERE s.id IS NULL OR b.id IS NULL`,
  );
  const [{ count: nullDates }] = await prisma.$queryRawUnsafe(
    resume
      ? "SELECT COUNT(*) AS count FROM collections WHERE created_at IS NULL OR updated_at IS NULL OR position IS NULL"
      : "SELECT COUNT(*) AS count FROM sheets WHERE created IS NULL OR updated IS NULL OR `order` IS NULL",
  );
  if (Number(orphaned) || Number(highlights) || Number(nullDates))
    throw new Error(
      `Resolve inconsistent rows first: memberships=${orphaned}, highlights=${highlights}, null collection fields=${nullDates}`,
    );
  const [counts] = await prisma.$queryRawUnsafe(
    `SELECT (SELECT COUNT(*) FROM ${booksTable}) AS items, (SELECT COUNT(*) FROM ${sheetsTable}) AS collections, (SELECT COUNT(*) FROM ${booksTable} WHERE finished IS NOT NULL) AS logs`,
  );
  const fingerprintColumns =
    "id, user_id, sheet_id, title, author, category, image, impression, memo, is_public_memo, is_purchasable, COALESCE(price, '<null>'), COALESCE(DATE_FORMAT(finished, '%Y-%m-%d %H:%i:%s'), '<null>'), created, updated";
  const snapshots = await prisma.$queryRawUnsafe(
    `SELECT id, SHA2(CONCAT_WS(CHAR(31), ${fingerprintColumns}), 256) AS fingerprint FROM ${booksTable} ORDER BY id`,
  );
  console.log(
    "Preflight passed:",
    JSON.stringify(counts, (_, value) =>
      typeof value === "bigint" ? Number(value) : value,
    ),
  );
  if (!apply) {
    console.log(
      "Dry run only. To apply during a maintenance window, take a verified backup, stop all writers, then use --apply --writers-stopped --backup-verified.",
    );
  } else {
    if (
      !process.argv.includes("--writers-stopped") ||
      !process.argv.includes("--backup-verified")
    )
      throw new Error(
        "Confirm a verified backup and stopped writers with the documented flags.",
      );
    const statements = sql
      .replace(/^--.*$/gm, "")
      .split(";")
      .map((part) => part.trim())
      .filter(Boolean);
    // Record progress outside the database too: DDL cannot be rolled back by Prisma.
    const ledger = fileURLToPath(
      new URL("../.collection-migration-progress.json", import.meta.url),
    );
    const start = resume
      ? statements.indexOf(
          "ALTER TABLE collection_highlights MODIFY COLUMN collection_id INT UNSIGNED NOT NULL",
        )
      : 0;
    if (resume && start !== 20)
      throw new Error("Migration prefix changed; do not resume");
    for (let index = start; index < statements.length; index++) {
      await writeFile(
        ledger,
        JSON.stringify({
          state: "running",
          nextStatement: index,
          total: statements.length,
        }),
      );
      await prisma.$executeRawUnsafe(statements[index]);
      console.log(`Applied ${index + 1}/${statements.length}`);
    }
    const [after] = await prisma.$queryRawUnsafe(
      "SELECT (SELECT COUNT(*) FROM items) AS items, (SELECT COUNT(*) FROM collections) AS collections, (SELECT COUNT(*) FROM item_logs) AS logs, (SELECT COUNT(*) FROM legacy_books) AS legacyItems, (SELECT COUNT(*) FROM collection_items) AS memberships",
    );
    if (
      Number(after.items) !== Number(counts.items) ||
      Number(after.collections) !== Number(counts.collections) ||
      Number(after.logs) !== Number(counts.logs) ||
      Number(after.legacyItems) !== Number(counts.items) ||
      Number(after.memberships) !== Number(counts.items)
    )
      throw new Error(
        "Post-migration counts differ. Keep writers stopped and restore the backup.",
      );
    const projected = await prisma.$queryRawUnsafe(
      `SELECT id, SHA2(CONCAT_WS(CHAR(31), ${fingerprintColumns}), 256) AS fingerprint FROM legacy_books ORDER BY id`,
    );
    if (
      snapshots.length !== projected.length ||
      snapshots.some(
        (row, index) =>
          row.id !== projected[index].id ||
          row.fingerprint !== projected[index].fingerprint,
      )
    )
      throw new Error(
        "IDs, ownership, fields, memos or references differ after migration. Keep writers stopped and restore the backup.",
      );
    await writeFile(
      ledger,
      JSON.stringify({
        state: "complete",
        completedAt: new Date().toISOString(),
      }),
    );
    console.log(
      "Migration and count verification complete. Rebuild clients, deploy the matching code, smoke test, then resume writes.",
    );
  }
} finally {
  await prisma.$disconnect();
}
