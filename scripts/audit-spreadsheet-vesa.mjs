import { createRequire } from "node:module"
const require = createRequire(import.meta.url)
const XLSX = require("xlsx")

const wb = XLSX.readFile("D:/ダウンロード/monitors.xlsx")
const sheet = wb.Sheets[wb.SheetNames[0]]
const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" })

function isMissing(v) {
  if (v == null) return true
  const t = String(v).trim()
  return !t || t === "-" || t === "—"
}

let missing = 0
let filled = 0
const missingIds = []

for (const cols of rows.slice(1)) {
  const id = String(cols[0] ?? "").trim()
  if (!id) continue
  const vesa = cols[8]
  if (isMissing(vesa)) {
    missing++
    missingIds.push(id)
  } else filled++
}

console.log({ total: rows.length - 1, missing, filled, sampleMissing: missingIds.slice(0, 15) })
