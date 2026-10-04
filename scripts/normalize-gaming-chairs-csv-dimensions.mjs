/**
 * gaming_chairs.csv の「寸法」列を W:/D:/H: 形式に統一。
 * 空欄は任意でエクスポート CSV（商品名称一致）から補完。
 *
 * Usage:
 *   npx tsx scripts/normalize-gaming-chairs-csv-dimensions.mjs [--apply] [--merge-ext [path]]
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { formatDimensions } from "../lib/gaming-chair-dimension-display.ts"

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const csvPath = path.join(root, "gaming_chairs.csv")
const defaultExt = path.join(
  path.dirname(root),
  "exported_gaming_chairs_185 - exported_gaming_chairs_185.csv",
)

const apply = process.argv.includes("--apply")
const mergeExtIdx = process.argv.indexOf("--merge-ext")
const mergeExt =
  mergeExtIdx >= 0
    ? process.argv[mergeExtIdx + 1] && !process.argv[mergeExtIdx + 1].startsWith("-")
      ? process.argv[mergeExtIdx + 1]
      : defaultExt
    : null

function parseCsv(text) {
  const rows = []
  let row = []
  let field = ""
  let inQuotes = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i++
        } else inQuotes = false
      } else field += c
      continue
    }
    if (c === '"') {
      inQuotes = true
      continue
    }
    if (c === ",") {
      row.push(field)
      field = ""
      continue
    }
    if (c === "\r") continue
    if (c === "\n") {
      row.push(field)
      if (row.some((x) => x.trim())) rows.push(row)
      row = []
      field = ""
      continue
    }
    field += c
  }
  row.push(field)
  if (row.some((x) => x.trim())) rows.push(row)
  return rows
}

function csvCell(value) {
  const text = String(value ?? "")
  if (/[",\r\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`
  return text
}

function serializeCsv(rows) {
  return `${rows.map((row) => row.map(csvCell).join(",")).join("\n")}\n`
}

function normName(name) {
  return String(name ?? "")
    .trim()
    .replace(/\s+/g, " ")
}

const table = parseCsv(fs.readFileSync(csvPath, "utf8").replace(/^\uFEFF/, ""))
const headers = table[0]
const dimIdx = headers.indexOf("寸法")
const nameIdx = headers.indexOf("商品名")
if (dimIdx < 0 || nameIdx < 0) {
  console.error("Missing 寸法 or 商品名 column")
  process.exit(1)
}

/** @type {Map<string, string>} */
const extByName = new Map()
if (mergeExt) {
  if (!fs.existsSync(mergeExt)) {
    console.warn("Merge source not found, skipping:", mergeExt)
  } else {
    const ext = parseCsv(fs.readFileSync(mergeExt, "utf8").replace(/^\uFEFF/, ""))
    const nameE = ext[0].indexOf("商品名称")
    const dimE = ext[0].findIndex((h) => /寸法/.test(h))
    for (const cells of ext.slice(1)) {
      const n = normName(cells[nameE])
      const d = (cells[dimE] ?? "").trim()
      if (n && d) extByName.set(n, d)
    }
    console.log(`Merge source: ${extByName.size} name(s) with dimensions from ${mergeExt}`)
  }
}

let filledFromExt = 0
let normalized = 0
let unchanged = 0

for (const cells of table.slice(1)) {
  let raw = (cells[dimIdx] ?? "").trim()
  const fromExt = mergeExt ? extByName.get(normName(cells[nameIdx])) : undefined
  if (!raw && fromExt) {
    raw = fromExt
    filledFromExt++
  } else if (raw && fromExt && /W:\s*x\s*D:\s*x\s*H:/i.test(raw)) {
    raw = fromExt
    filledFromExt++
  }
  if (!raw) continue

  const next = formatDimensions(raw)
  if (next === "-") continue
  if (next !== raw) {
    cells[dimIdx] = next
    normalized++
  } else {
    unchanged++
  }
}

console.log(
  JSON.stringify({
    apply,
    filledFromExt,
    normalized,
    unchanged,
    totalRows: table.length - 1,
  }),
)

if (apply) {
  fs.writeFileSync(csvPath, serializeCsv(table), "utf8")
  console.log("Wrote", csvPath)
} else {
  console.log("Dry run — pass --apply to write gaming_chairs.csv")
}
