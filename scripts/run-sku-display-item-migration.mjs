/**
 * 执行 sku.is_display_item 迁移（mysql2 在 TrendyCollectionFront/node_modules）。
 *
 *   node scripts/run-sku-display-item-migration.mjs --dev
 *   node scripts/run-sku-display-item-migration.mjs --config path/to/application-dev.yml
 *
 * 环境变量覆盖：MYSQL_HOST MYSQL_PORT MYSQL_USER MYSQL_PASSWORD MYSQL_DATABASE
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { createConnection } from 'mysql2/promise'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const frontRoot = path.resolve(__dirname, '..')
const repoRoot = path.resolve(frontRoot, '..')
const defaultDevYml = path.join(
  repoRoot,
  'TrendyCollectionService/TrendyCollectionOrderAdmin/src/main/resources/application-dev.yml',
)
const sqlPath = path.join(
  repoRoot,
  'TrendyCollectionService/database/migrations/2026-04-17-sku-is-display-item.sql',
)

function parseArgs(argv) {
  let configPath = null
  let useDev = false
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === '--dev') {
      useDev = true
    } else if (argv[i] === '--config' && argv[i + 1]) {
      configPath = argv[++i]
    }
  }
  return { useDev, configPath }
}

function loadDatasourceFromYaml(filePath) {
  const text = fs.readFileSync(filePath, 'utf8')
  const urlLine = text.match(/^\s*url:\s*(.+)$/m)
  const userLine = text.match(/^\s*username:\s*(.+)$/m)
  const passLine = text.match(/^\s*password:\s*(.+)$/m)
  if (!urlLine?.[1] || !userLine?.[1] || !passLine?.[1]) {
    throw new Error(`Could not parse datasource from ${filePath}`)
  }
  const jdbc = urlLine[1].trim()
  const user = userLine[1].trim()
  const password = passLine[1].trim()
  const m = jdbc.match(/^jdbc:mysql:\/\/([^:/?#]+):(\d+)\/([^?&#]+)/)
  if (!m) {
    throw new Error(`Unsupported jdbc url: ${jdbc}`)
  }
  return {
    host: m[1],
    port: Number(m[2]),
    database: m[3],
    user,
    password,
  }
}

const { useDev, configPath } = parseArgs(process.argv)

let host
let port
let user
let password
let database

if (useDev || configPath) {
  const yml = configPath || defaultDevYml
  const ds = loadDatasourceFromYaml(yml)
  host = ds.host
  port = ds.port
  user = ds.user
  password = ds.password
  database = ds.database
  console.log('Using datasource from', path.relative(repoRoot, yml))
} else if (process.env.MYSQL_HOST) {
  host = process.env.MYSQL_HOST
  port = Number(process.env.MYSQL_PORT || 3306)
  user = process.env.MYSQL_USER || 'root'
  password = process.env.MYSQL_PASSWORD ?? ''
  database = process.env.MYSQL_DATABASE || 'trendy_collection'
} else {
  host = '127.0.0.1'
  port = 3306
  user = 'root'
  password = 'root'
  database = 'trendy_collection'
}

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
