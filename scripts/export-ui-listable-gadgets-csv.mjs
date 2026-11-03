/**
 * カード一覧 UI と同一の件数のみ CSV 出力（getListableGadgets(gadgets, false)）。
 * Usage: npm run export:ui-list
 * Output: pc_gearmatch_1819_items.csv
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { gadgets, getListableGadgets } from "../lib/gadgets.ts"

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const outPath = path.join(root, "pc_gearmatch_1819_items.csv")

const list = getListableGadgets(gadgets, false)
const { GADGET_EXPORT_CSV_HEADERS, gadgetToExportCsvRow } = await import(
  "../lib/gadget-export.ts"
)

const lines = [GADGET_EXPORT_CSV_HEADERS.join(",")]

for (const gadget of list) {
  lines.push(gadgetToExportCsvRow(gadget))
}

fs.writeFileSync(outPath, `\uFEFF${lines.join("\n")}\n`, "utf8")

console.log(`UI listable export: ${list.length} rows`)
console.log(`Wrote ${outPath}`)

if (list.length !== 1819) {
  console.warn(
    `Warning: expected 1819 UI items, got ${list.length}. Filename is still pc_gearmatch_1819_items.csv.`,
  )
}
