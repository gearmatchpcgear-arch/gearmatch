/**
 * Export all gadget data from lib/gadgets.ts to gadgets.csv (project root).
 * Usage: npx tsx scripts/export-gadgets-csv.mjs
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { allSourceGadgets } from "../lib/gadgets.ts"

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const outPath = path.join(root, "gadgets.csv")

const HEADERS = [
  "id",
  "name",
  "category",
  "brand",
  "inputs",
  "samplingRate",
  "phantomPower",
  "systemRequirements",
  "price",
]

function csvCell(value) {
  if (value === null || value === undefined) return ""
  const text = String(value)
  if (/[",\r\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`
  }
  return text
}

function row(values) {
  return values.map(csvCell).join(",")
}

const lines = [row(HEADERS)]

for (const gadget of allSourceGadgets) {
  lines.push(
    row([
      gadget.id,
      gadget.name,
      gadget.category,
      gadget.brand,
      gadget.inputs ?? "",
      gadget.samplingRate ?? "",
      gadget.phantomPower ?? "",
      gadget.systemRequirements ?? "",
      gadget.price ?? "",
    ]),
  )
}

fs.writeFileSync(outPath, `\uFEFF${lines.join("\n")}\n`, "utf8")

console.log(`Wrote ${allSourceGadgets.length} rows to ${outPath}`)
