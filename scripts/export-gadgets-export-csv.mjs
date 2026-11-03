/**
 * 全ガジェット（allSourceGadgets）を CSV エクスポート。
 * Usage: npm run export:gadgets
 * Output: gadgets_export.csv（プロジェクトルート）
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { allSourceGadgets } from "../lib/gadgets.ts"
import {
  GADGET_EXPORT_CSV_HEADERS,
  GADGET_EXPORT_EXTENDED_HEADERS,
  gadgetToExportCsvRow,
  gadgetToExtendedExportCsvRow,
} from "../lib/gadget-export.ts"

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const outPath = path.join(root, "gadgets_export.csv")
const extendedPath = path.join(root, "gadgets_export_extended.csv")

const lines = [GADGET_EXPORT_CSV_HEADERS.join(",")]
const extendedLines = [GADGET_EXPORT_EXTENDED_HEADERS.join(",")]

for (const gadget of allSourceGadgets) {
  lines.push(gadgetToExportCsvRow(gadget))
  extendedLines.push(gadgetToExtendedExportCsvRow(gadget))
}

const bom = "\uFEFF"
fs.writeFileSync(outPath, `${bom}${lines.join("\n")}\n`, "utf8")
fs.writeFileSync(extendedPath, `${bom}${extendedLines.join("\n")}\n`, "utf8")

console.log(`Wrote ${allSourceGadgets.length} rows to:`)
console.log(`  ${outPath}`)
console.log(`  ${extendedPath}`)
