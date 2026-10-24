import { createRequire } from "node:module";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import {
  mkdirSync,
  openSync,
  closeSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";

const require = createRequire(
  new URL("../apps/web/package.json", import.meta.url),
);
const { PrismaClient } = require("@prisma/client");
const directory = process.env.BACKUP_DIRECTORY;
if (!directory || !process.env.DATABASE_URL)
  throw new Error("Backup configuration is required");
const source = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_URL } },
});
const normalize = (_, value) =>
  typeof value === "bigint" ? value.toString() : value;
const quote = (name) => "`" + name.replaceAll("`", "``") + "`";

async function manifest(client) {
  const tables = await client.$queryRawUnsafe(
    "SELECT TABLE_NAME AS name FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_TYPE = 'BASE TABLE' ORDER BY TABLE_NAME",
  );
  const result = {};
  for (const { name } of tables) {
    const rows = await client.$queryRawUnsafe(`SELECT * FROM ${quote(name)}`);
    const values = rows.map((row) => JSON.stringify(row, normalize)).sort();
    result[name] = {
      count: rows.length,
      hash: createHash("sha256").update(JSON.stringify(values)).digest("hex"),
    };
  }
  return result;
}

function mysql(command, connection, extra, input, output) {
  const url = new URL(connection);
  const args = [
    "--protocol=TCP",
    "--host=" + url.hostname,
    "--port=" + (url.port || "3306"),
    "--user=" + decodeURIComponent(url.username),
  ];
  if (!["localhost", "127.0.0.1"].includes(url.hostname))
    args.push(
      "--ssl-mode=VERIFY_IDENTITY",
      "--ssl-ca=/etc/ssl/certs/ca-certificates.crt",
    );
  args.push(...extra, decodeURIComponent(url.pathname.slice(1)));
  execFileSync(command, args, {
    env: { ...process.env, MYSQL_PWD: decodeURIComponent(url.password) },
    stdio: [input, output, "inherit"],
  });
}

try {
  if (process.argv.includes("--restore")) {
    if (!process.env.PREVIEW_RESTORE_SQL || !process.env.RESTORE_DATABASE_URL)
      throw new Error("Restoration configuration is required");
    const restoreUrl = new URL(process.env.RESTORE_DATABASE_URL);
    if (
      restoreUrl.hostname !== "127.0.0.1" ||
      restoreUrl.pathname !== "/restore_check"
    )
      throw new Error(
        "Recovery verification must use the local restore database",
      );
    const current = await manifest(source);
    if (!current.items || !current.collections || current.books)
      throw new Error("Recovery requires the expected partial migration state");
    mkdirSync(directory, { recursive: true, mode: 0o700 });
    const sql = join(directory, "recovery.sql");
    writeFileSync(
      sql,
      process.env.PREVIEW_RESTORE_SQL.replace(
        /^LOCK TABLES .*;\r?\n/gm,
        "",
      ).replace(/^UNLOCK TABLES;\r?\n/gm, ""),
      { mode: 0o600 },
    );
    const local = new PrismaClient({
      datasources: { db: { url: restoreUrl.toString() } },
    });
    await local.$executeRawUnsafe("CREATE DATABASE restore_recovery");
    await local.$disconnect();
    restoreUrl.pathname = "/restore_recovery";
    const restored = new PrismaClient({
      datasources: { db: { url: restoreUrl.toString() } },
    });
    try {
      for (const connection of [
        restoreUrl.toString(),
        process.env.DATABASE_URL,
      ]) {
        const input = openSync(sql, "r");
        try {
          mysql("mysql", connection, [], input, "ignore");
        } finally {
          closeSync(input);
        }
      }
      const expected = await manifest(restored);
      const actual = await manifest(source);
      const original = Object.fromEntries(
        Object.entries(actual).filter(([name]) => name in expected),
      );
      if (JSON.stringify(expected) !== JSON.stringify(original))
        throw new Error("Recovered tables do not match the backup");
      const canonical = [
        "collection_highlights",
        "collection_items",
        "item_comments",
        "item_logs",
        "item_templates",
        "item_types",
        "items",
        "collections",
      ];
      const extra = Object.keys(actual).filter((name) => !(name in expected));
      if (extra.some((name) => !canonical.includes(name)))
        throw new Error("Unexpected tables require inspection before recovery");
      for (const name of canonical.filter((name) => extra.includes(name)))
        await source.$executeRawUnsafe(`DROP TABLE ${quote(name)}`);
      if (JSON.stringify(expected) !== JSON.stringify(await manifest(source)))
        throw new Error("Recovery verification failed");
      console.log("Preview database recovered and verified against the backup");
    } finally {
      await restored.$disconnect();
    }
  } else if (process.argv.includes("--check-unchanged")) {
    const expected = JSON.parse(
      readFileSync(join(directory, "manifest.json"), "utf8"),
    );
    if (JSON.stringify(expected) !== JSON.stringify(await manifest(source)))
      throw new Error(
        "Database changed after backup; stop writers and repeat the backup",
      );
    console.log("Source still matches the verified backup");
  } else {
    if (!process.env.RESTORE_DATABASE_URL || !process.env.BACKUP_CERTIFICATE)
      throw new Error(
        "Restore database and encryption certificate are required",
      );
    mkdirSync(directory, { recursive: true, mode: 0o700 });
    const sql = join(directory, "preview.sql");
    const dump = openSync(sql, "w", 0o600);
    try {
      mysql(
        "mysqldump",
        process.env.DATABASE_URL,
        [
          "--skip-lock-tables",
          "--skip-add-locks",
          "--no-tablespaces",
          "--column-statistics=0",
          "--set-gtid-purged=OFF",
          "--hex-blob",
        ],
        "ignore",
        dump,
      );
    } finally {
      closeSync(dump);
    }
    const restore = new PrismaClient({
      datasources: { db: { url: process.env.RESTORE_DATABASE_URL } },
    });
    try {
      const tables = await restore.$queryRawUnsafe(
        "SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE()",
      );
      if (tables.length)
        throw new Error("Restore verification requires an empty database");
      const input = openSync(sql, "r");
      try {
        mysql("mysql", process.env.RESTORE_DATABASE_URL, [], input, "ignore");
      } finally {
        closeSync(input);
      }
      const expected = await manifest(source);
      if (JSON.stringify(expected) !== JSON.stringify(await manifest(restore)))
        throw new Error("Restored data does not match source");
      writeFileSync(
        join(directory, "manifest.json"),
        JSON.stringify(expected),
        { mode: 0o600 },
      );
      console.log(
        `Backup restored and verified across ${Object.keys(expected).length} tables`,
      );
    } finally {
      await restore.$disconnect();
    }
    const certificate = join(directory, "certificate.pem");
    writeFileSync(
      certificate,
      Buffer.from(process.env.BACKUP_CERTIFICATE, "base64"),
      { mode: 0o600 },
    );
    execFileSync("openssl", [
      "cms",
      "-encrypt",
      "-binary",
      "-aes256",
      "-in",
      sql,
      "-out",
      join(directory, "preview.sql.cms"),
      "-outform",
      "DER",
      certificate,
    ]);
    console.log("Backup encrypted for the supplied certificate");
  }
} finally {
  await source.$disconnect();
}
