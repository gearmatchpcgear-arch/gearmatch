/**
 * gaming_chairs.csv の寸法列を W:/D:/H: 形式に統一（表示と同じ formatDimensions）
 *
 * npx tsx scripts/normalize-gaming-chair-csv-dimensions.mjs [--apply]
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { formatDimensions } from "../lib/gaming-chair-dimension-display.ts"

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const csvPath = path.join(root, "gaming_chairs.csv")
const apply = process.argv.includes("--apply")

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
      if (row.some((cell) => cell.trim() !== "")) rows.push(row)
      row = []
      field = ""
      continue
    }
    field += c
  }
  row.push(field)
  if (row.some((cell) => cell.trim() !== "")) rows.push(row)
  return rows
}

function writeCsv(table) {
  const lines = table.map((row) =>
    row
      .map((cell) => {
        const text = String(cell ?? "")
        if (/[",\r\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`
        return text
      })
      .join(","),
  )
  fs.writeFileSync(csvPath, `\uFEFF${lines.join("\n")}\n`, "utf8")
}

const table = parseCsv(fs.readFileSync(csvPath, "utf8").replace(/^\uFEFF/, ""))
const headers = table[0].map((h) => h.trim())
const dimIdx = headers.indexOf("寸法")
if (dimIdx < 0) {
  console.error("Missing 寸法 column")
  process.exit(1)
}

let updated = 0
for (let i = 1; i < table.length; i++) {
  const raw = (table[i][dimIdx] ?? "").trim()
  if (!raw) continue
  const formatted = formatDimensions(raw)
  if (formatted === "-" || formatted === raw) continue
  if (apply) table[i][dimIdx] = formatted
  updated++
}

console.log(`${apply ? "Updated" : "Would update"} ${updated} dimension cell(s)`)
if (apply) {
  writeCsv(table)
  console.log("Wrote", csvPath)
} else if (updated > 0) {
  console.log("Re-run with --apply")
}
