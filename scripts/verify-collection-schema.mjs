import { createRequire } from "node:module";
const require = createRequire(
  new URL("../apps/web/package.json", import.meta.url),
);
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
try {
  const rows = await prisma.$queryRawUnsafe(
    "SELECT TABLE_NAME AS name, TABLE_TYPE AS type FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE()",
  );
  const tables = new Map(rows.map((row) => [row.name, row.type]));
  for (const name of [
    "collections",
    "items",
    "item_types",
    "collection_items",
    "item_logs",
    "item_templates",
    "collection_highlights",
    "item_comments",
  ]) {
    if (tables.get(name) !== "BASE TABLE")
      throw new Error(
        `Missing canonical table: ${name}. Apply the reviewed collection migration during a maintenance window; do not use db push.`,
      );
  }
  if (
    (await prisma.itemType.count({
      where: { key: { in: ["book", "movie"] } },
    })) !== 2
  )
    throw new Error("Initial item types are missing");
  await prisma.mcpGrant.count({
    where: { scope: { in: ["books:read", "items:read"] } },
  });
  console.log("Collection schema verified. No schema mutation was performed.");
} finally {
  await prisma.$disconnect();
}
