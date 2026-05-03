/**
 * Run a .sql migration file against MySQL using mysql2 (devDependency of this package).
 *
 * Usage (from TrendyCollectionFront):
 *   $env:MYSQL_HOST="127.0.0.1"
 *   $env:MYSQL_PORT="3306"
 *   $env:MYSQL_USER="trendy"
 *   $env:MYSQL_PASSWORD="***"
 *   $env:MYSQL_DATABASE="trendy"
 *   node scripts/apply-sql-migration.mjs ../TrendyCollectionService/database/migrations/2026-05-03-user-prize-asset-order-reward-level.sql
 *
 * On duplicate column / index errors, fix DB state or adjust SQL before re-run.
 */
import fs from "fs";
import path from "path";
import mysql from "mysql2/promise";

const sqlPath = process.argv[2];
if (!sqlPath) {
  console.error("Usage: node scripts/apply-sql-migration.mjs <path-to.sql>");
  process.exit(1);
}

const abs = path.resolve(process.cwd(), sqlPath);
if (!fs.existsSync(abs)) {
  console.error("File not found:", abs);
  process.exit(1);
}

const host = process.env.MYSQL_HOST || "127.0.0.1";
const port = Number(process.env.MYSQL_PORT || "3306");
const user = process.env.MYSQL_USER;
const password = process.env.MYSQL_PASSWORD ?? "";
const database = process.env.MYSQL_DATABASE;

if (!user || !database) {
  console.error("Set MYSQL_USER and MYSQL_DATABASE (and MYSQL_PASSWORD if required).");
  process.exit(1);
}

const sql = fs.readFileSync(abs, "utf8");

const conn = await mysql.createConnection({
  host,
  port,
  user,
  password,
  database,
  multipleStatements: true,
});

try {
  await conn.query(sql);
  console.log("OK:", abs);
} finally {
  await conn.end();
}
