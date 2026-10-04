import fs from "node:fs"
import { formatDimensions } from "../lib/gaming-chair-dimension-display.ts"

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

const table = parseCsv(fs.readFileSync("gaming_chairs.csv", "utf8").replace(/^\uFEFF/, ""))
const dimIdx = table[0].indexOf("寸法")
const issues = []

for (const cells of table.slice(1)) {
  const id = (cells[0] ?? "").trim()
  const raw = (cells[dimIdx] ?? "").trim()
  if (!raw) continue
  const fmt = formatDimensions(raw)
  const ok =
    /^W:\s*.+×\s*D:\s*.+×\s*H:/i.test(fmt) ||
    /^W:\s*.+×\s*D:/i.test(fmt) ||
    /^W:\s*.+×\s*H:/i.test(fmt)
  if (!ok) issues.push({ id, raw, fmt })
}

console.log("with dimensions", table.length - 1 - issues.length + issues.filter((i) => i.fmt === "-").length)
console.log("issues", issues.length)
for (const item of issues.slice(0, 20)) {
  console.log(item.id, "=>", item.fmt, "| raw:", item.raw.slice(0, 80))
}
