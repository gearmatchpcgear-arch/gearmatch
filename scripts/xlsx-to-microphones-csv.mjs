/**
 * Convert microphones_extracted.xlsx → microphones_extracted.csv (project root)
 * Usage: npx tsx scripts/xlsx-to-microphones-csv.mjs [xlsxPath]
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import XLSX from "xlsx"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, "..")
const DEFAULT_XLSX = path.join(ROOT, "microphones_extracted.xlsx")
const XLSX_PATH = process.argv[2] ?? DEFAULT_XLSX
const OUT_PATH = path.join(ROOT, "microphones_extracted.csv")

function csvCell(value) {
  const text = value == null ? "" : String(value)
  if (!text) return "-"
  if (/[",\r\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`
  return text
}

const wb = XLSX.readFile(XLSX_PATH)
const ws = wb.Sheets[wb.SheetNames[0]]
const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" })
const lines = rows.map((row) => row.map(csvCell).join(","))
fs.writeFileSync(OUT_PATH, `\uFEFF${lines.join("\n")}\n`, "utf8")
console.log(`Wrote ${rows.length - 1} rows to ${OUT_PATH}`)
