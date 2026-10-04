/**
 * Export listable gaming-chair gadgets (same set as the app UI) to gaming_chairs.csv (project root).
 * Usage: npx tsx scripts/export-gaming-chairs-csv.mjs [outPath]
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import {
  filterGadgetsByCategory,
  gadgets,
  getListableGadgets,
  UNSPECIFIED_SPEC,
} from "../lib/gadgets.ts"
import {
  gamingChairHasOttoman,
  getGamingChairFrameMaterial,
  getGamingChairMaterial,
  getGamingChairMaxRecliningAngle,
  getGamingChairStyle,
} from "../lib/gaming-chair-filter-tags.ts"

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const outPath = process.argv[2] ?? path.join(root, "gaming_chairs.csv")

const HEADERS = [
  "ID",
  "商品名",
  "商品説明",
  "メーカー",
  "価格",
  "素材",
  "形状",
  "最大リクライニング角度",
  "フレームの種類",
  "オットマンの有無",
]

function normalizeField(value) {
  if (value === null || value === undefined) return ""
  const text = String(value).trim()
  if (!text || text === UNSPECIFIED_SPEC || text === "—" || text === "-") return ""
  return text
}

function csvCell(value) {
  const text = normalizeField(value)
  if (!text) return ""
  if (/[",\r\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`
  }
  return text
}

function row(values) {
  return values.map(csvCell).join(",")
}

function readLabeledValue(gadget, label) {
  for (const h of gadget.highlights) {
    if (h.label === label) {
      const value = normalizeField(h.value)
      if (value) return value
    }
  }
  for (const group of gadget.specGroups) {
    for (const specRow of group.rows) {
      if (specRow.label === label) {
        const value = normalizeField(specRow.value)
        if (value) return value
      }
    }
  }
  return null
}

function getDescription(gadget) {
  const text = gadget.tagline?.trim()
  if (!text) return ""
  return text.replace(/[\r\n]+/g, " ").replace(/\s+/g, " ").trim()
}

function getOttomanDisplay(gadget) {
  const fromLabel = readLabeledValue(gadget, "オットマン")
  if (fromLabel) return fromLabel
  if (typeof gadget.hasOttoman === "boolean") {
    return gadget.hasOttoman ? "あり" : "なし"
  }
  return gamingChairHasOttoman(gadget) ? "あり" : "なし"
}

function formatPrice(gadget) {
  if (gadget.price == null || Number.isNaN(gadget.price)) return ""
  return gadget.price
}

const chairs = filterGadgetsByCategory(
  getListableGadgets(gadgets, false),
  "gaming-chair",
).sort((a, b) => a.id.localeCompare(b.id))

const lines = [HEADERS.join(",")]

for (const gadget of chairs) {
  lines.push(
    row([
      gadget.id,
      gadget.name,
      getDescription(gadget),
      gadget.brand,
      formatPrice(gadget),
      normalizeField(getGamingChairMaterial(gadget)),
      normalizeField(getGamingChairStyle(gadget)),
      normalizeField(getGamingChairMaxRecliningAngle(gadget)),
      normalizeField(getGamingChairFrameMaterial(gadget)),
      getOttomanDisplay(gadget),
    ]),
  )
}

fs.writeFileSync(outPath, `\uFEFF${lines.join("\n")}\n`, "utf8")

console.log(`Wrote ${chairs.length} gaming-chair rows to ${outPath}`)
