import { createRequire } from "node:module";
import { readFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const require = createRequire(
  new URL("../apps/web/package.json", import.meta.url),
);
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

try {
  const tables = await prisma.$queryRawUnsafe(
    "SELECT TABLE_NAME AS name, TABLE_TYPE AS type FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE()",
  );
  if (tables.length) {
    if (
      process.argv.includes("--if-empty") &&
      tables.some((row) => row.name === "items" && row.type === "BASE TABLE")
    ) {
      console.log("Collection database already initialized; no changes made.");
    } else {
      throw new Error(
        "Initialization requires an empty database. For existing book data, use the reviewed collection migration. No tables were changed.",
      );
    }
  } else {
    const ddl = execFileSync(
      process.execPath,
      [
        require.resolve("prisma/build/index.js"),
        "migrate",
        "diff",
        "--from-empty",
        "--to-schema-datamodel",
        fileURLToPath(
          new URL("../apps/web/prisma/schema.prisma", import.meta.url),
        ),
        "--script",
      ],
      { encoding: "utf8", stdio: ["ignore", "pipe", "inherit"] },
    );
    const migration = await readFile(
      new URL("../docs/sql/collection-model.sql", import.meta.url),
      "utf8",
    );
    const split = (sql) =>
      sql
        .replace(/^--.*$/gm, "")
        .replace(/^Environment variables loaded from.*$/gm, "")
        .split(";")
        .map((statement) => statement.trim())
        .filter(Boolean);
    const statements = [
      ...split(ddl),
      ...split(migration).filter((statement) =>
        statement.startsWith("INSERT INTO item_types"),
      ),
    ];
    if (!process.argv.includes("--apply")) {
      console.log(
        `Dry run: ${statements.length} statements prepared for an empty database. Use --apply to initialize.`,
      );
    } else {
      for (const statement of statements)
        await prisma.$executeRawUnsafe(statement);
      console.log(
        "Empty database initialized with canonical tables and initial item types.",
      );
    }
  }
} finally {
  await prisma.$disconnect();
}
