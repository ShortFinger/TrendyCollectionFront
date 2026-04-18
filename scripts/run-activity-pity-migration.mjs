/**
 * 执行 activity_pity 表迁移（依赖本目录 node_modules 中的 mysql2）。
 *
 * 在 TrendyCollectionFront 下执行：
 *   node scripts/run-activity-pity-migration.mjs
 *
 * 环境变量（可选）：MYSQL_HOST MYSQL_PORT MYSQL_USER MYSQL_PASSWORD MYSQL_DATABASE
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { createConnection } from 'mysql2/promise'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const frontRoot = path.resolve(__dirname, '..')
const sqlPath = path.join(
  frontRoot,
  '../TrendyCollectionService/database/migrations/2026-04-18-activity-pity-config-state.sql',
)

const host = process.env.MYSQL_HOST || '127.0.0.1'
const port = Number(process.env.MYSQL_PORT || 3306)
const user = process.env.MYSQL_USER || 'root'
const password = process.env.MYSQL_PASSWORD ?? 'root'
const database = process.env.MYSQL_DATABASE || 'trendy_collection'

const sql = fs.readFileSync(sqlPath, 'utf8')

const conn = await createConnection({
  host,
  port,
  user,
  password,
  database,
  multipleStatements: true,
})

try {
  await conn.query(sql)
  console.log('OK:', path.basename(sqlPath))
} finally {
  await conn.end()
}
