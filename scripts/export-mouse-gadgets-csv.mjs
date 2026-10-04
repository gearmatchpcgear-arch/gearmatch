/**
 * Export mouse category gadgets to mouse_gadgets.csv (project root).
 * Usage: npx tsx scripts/export-mouse-gadgets-csv.mjs
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import {
  allSourceGadgets,
  getCardHighlights,
  getGadgetConnectionDisplay,
  UNSPECIFIED_SPEC,
} from "../lib/gadgets.ts"

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const outPath = path.join(root, "mouse_gadgets.csv")

const HEADERS = [
  "id",
  "brand",
  "name",
  "fullTitle",
  "重量",
  "電源",
  "読み取り方式",
  "ボタン数",
  "接続方式",
]

function normalizeField(value) {
  if (value === null || value === undefined) return UNSPECIFIED_SPEC
  const text = String(value).trim()
  if (!text || text === UNSPECIFIED_SPEC || text === "-") return UNSPECIFIED_SPEC
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

function cardSpec(gadget, label) {
  return getCardHighlights(gadget).find((h) => h.label === label)?.value
}

const mouseGadgets = allSourceGadgets
  .filter((g) => g.category === "mouse")
  .sort((a, b) => {
    const brandCmp = a.brand.localeCompare(b.brand, "ja")
    if (brandCmp !== 0) return brandCmp
    return a.name.localeCompare(b.name, "ja")
  })

const lines = [row(HEADERS)]

for (const gadget of mouseGadgets) {
  lines.push(
    row([
      gadget.id,
      gadget.brand,
      gadget.name,
      gadget.tagline || UNSPECIFIED_SPEC,
      cardSpec(gadget, "重量"),
      cardSpec(gadget, "電源"),
      cardSpec(gadget, "読み取り方式"),
      cardSpec(gadget, "ボタン数"),
      getGadgetConnectionDisplay(gadget),
    ]),
  )
}

fs.writeFileSync(outPath, `\uFEFF${lines.join("\n")}\n`, "utf8")

console.log(`Wrote ${mouseGadgets.length} mouse rows to ${outPath}`)
