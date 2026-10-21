import { createRequire } from "node:module";
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const require = createRequire(
  new URL("../apps/web/package.json", import.meta.url),
);
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const apply = process.argv.includes("--apply");
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
    "books",
    "sheets",
    "template_books",
    "yearly_top_books",
    "book_comments",
    "likes",
    "purchases",
    "notifications",
    "ai_summaries",
    "mcp_grants",
  ]) {
    if (!names.has(name)) throw new Error(`Missing legacy table: ${name}`);
  }
  const [{ count: orphaned }] = await prisma.$queryRawUnsafe(
    "SELECT COUNT(*) AS count FROM books b LEFT JOIN sheets s ON s.id = b.sheet_id AND s.user_id = b.user_id WHERE s.id IS NULL",
  );
  const [{ count: highlights }] = await prisma.$queryRawUnsafe(
    "SELECT COUNT(*) AS count FROM yearly_top_books h LEFT JOIN sheets s ON s.user_id = h.user_id AND BINARY s.name = BINARY h.year LEFT JOIN books b ON b.id = h.book_id AND b.user_id = h.user_id AND b.sheet_id = s.id WHERE s.id IS NULL OR b.id IS NULL",
  );
  const [{ count: nullDates }] = await prisma.$queryRawUnsafe(
    "SELECT COUNT(*) AS count FROM sheets WHERE created IS NULL OR updated IS NULL OR `order` IS NULL",
  );
  if (Number(orphaned) || Number(highlights) || Number(nullDates))
    throw new Error(
      `Resolve inconsistent rows first: memberships=${orphaned}, highlights=${highlights}, null collection fields=${nullDates}`,
    );
  const [counts] = await prisma.$queryRawUnsafe(
    "SELECT (SELECT COUNT(*) FROM books) AS items, (SELECT COUNT(*) FROM sheets) AS collections, (SELECT COUNT(*) FROM books WHERE finished IS NOT NULL) AS logs",
  );
  const fingerprintColumns =
    "id, user_id, sheet_id, title, author, category, image, impression, memo, is_public_memo, is_purchasable, COALESCE(price, '<null>'), COALESCE(DATE_FORMAT(finished, '%Y-%m-%d %H:%i:%s'), '<null>'), created, updated";
  const snapshots = await prisma.$queryRawUnsafe(
    `SELECT id, SHA2(CONCAT_WS(CHAR(31), ${fingerprintColumns}), 256) AS fingerprint FROM books ORDER BY id`,
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
    for (let index = 0; index < statements.length; index++) {
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
