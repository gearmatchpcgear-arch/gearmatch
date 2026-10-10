/**
 * Export mouse category gadgets from lib/gadgets.ts to mouse_products.csv (project root).
 * Usage: npx tsx scripts/export-mouse-products-csv.mjs
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import {
  allSourceGadgets,
  formatPrice,
  getCardDisplayPrice,
  getCardHighlights,
  hasCardDisplayPrice,
  UNSPECIFIED_SPEC,
} from "../lib/gadgets.ts"

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const outPath = path.join(root, "data", "mouse_products.csv")

const HEADERS = ["ID", "商品タイトル", "商品説明", "価格", "重量", "感度", "電源", "ボタン数"]

function normalizeField(value) {
  if (value === null || value === undefined) return "—"
  const text = String(value).trim()
  if (!text || text === UNSPECIFIED_SPEC) return "—"
  return text
}

function csvCell(value) {
  const text = normalizeField(value)
  if (/[",\r\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`
  }
  return text
}

function row(values) {
  return values.map(csvCell).join(",")
}

function highlightValue(gadget, label) {
  const entry = getCardHighlights(gadget).find((h) => h.label === label)
  return entry?.value ?? ""
}

function priceDisplay(gadget) {
  if (!hasCardDisplayPrice(gadget)) return "—"
  return formatPrice(getCardDisplayPrice(gadget))
}

const mouseGadgets = allSourceGadgets.filter((g) => g.category === "mouse")
const lines = [row(HEADERS)]

for (const gadget of mouseGadgets) {
  lines.push(
    row([
      gadget.id,
      gadget.name,
      gadget.tagline,
      priceDisplay(gadget),
      highlightValue(gadget, "重量"),
      highlightValue(gadget, "感度"),
      highlightValue(gadget, "電源"),
      highlightValue(gadget, "ボタン数"),
    ]),
  )
}

fs.writeFileSync(outPath, `\uFEFF${lines.join("\r\n")}\r\n`, "utf8")
console.log(`Wrote ${mouseGadgets.length} mouse rows to ${outPath}`)
