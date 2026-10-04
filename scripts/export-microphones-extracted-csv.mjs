/**
 * Export mic category gadgets to microphones_extracted.csv (project root).
 * Usage: npx tsx scripts/export-microphones-extracted-csv.mjs
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import {
  allSourceGadgets,
  getCardHighlights,
  getMicTypeLabel,
  UNSPECIFIED_SPEC,
} from "../lib/gadgets.ts"

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const outPath = path.join(root, "microphones_extracted.csv")
const MISSING = "-"

const HEADERS = [
  "id",
  "name",
  "商品説明",
  "指向性",
  "接続方式",
  "周波数特性",
  "マイクタイプ",
  "サンプルレート",
  "価格",
  "マイク感度",
  "その他機能",
]

function normalizeField(value) {
  if (value === null || value === undefined) return MISSING
  const text = String(value).trim()
  if (!text || text === UNSPECIFIED_SPEC || text === "—") return MISSING
  return text
}

function csvCell(value) {
  const text = normalizeField(value)
  if (text === MISSING) return MISSING
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

function micSampleRate(gadget) {
  const fromHighlight = gadget.highlights.find((h) => h.label === "サンプルレート")?.value
  if (fromHighlight) return fromHighlight
  for (const group of gadget.specGroups) {
    const specRow = group.rows.find((r) => r.label === "サンプルレート")
    if (specRow?.value) return specRow.value
  }
  return null
}

function micSensitivity(gadget) {
  if (gadget.micSensitivity) return gadget.micSensitivity
  const fromHighlight = gadget.highlights.find((h) => h.label === "マイク感度")?.value
  if (fromHighlight && fromHighlight !== UNSPECIFIED_SPEC) return fromHighlight
  for (const group of gadget.specGroups) {
    const specRow = group.rows.find((r) => r.label === "マイク感度")
    if (specRow?.value && specRow.value !== UNSPECIFIED_SPEC) return specRow.value
  }
  return null
}

function micType(gadget) {
  return cardSpec(gadget, "マイクタイプ") ?? getMicTypeLabel(gadget)
}

function micOtherFeature(gadget) {
  if (gadget.micSpreadsheetJTags?.length) {
    return gadget.micSpreadsheetJTags.join(" / ")
  }
  return null
}

const micGadgets = allSourceGadgets.filter((g) => g.category === "mic")
const lines = [row(HEADERS)]

for (const gadget of micGadgets) {
  lines.push(
    row([
      gadget.id,
      gadget.name,
      gadget.tagline,
      cardSpec(gadget, "指向性"),
      cardSpec(gadget, "接続方式"),
      cardSpec(gadget, "周波数特性"),
      micType(gadget),
      micSampleRate(gadget),
      gadget.price != null ? gadget.price : MISSING,
      micSensitivity(gadget),
      micOtherFeature(gadget),
    ]),
  )
}

fs.writeFileSync(outPath, `\uFEFF${lines.join("\n")}\n`, "utf8")

console.log(`Wrote ${micGadgets.length} mic rows to ${outPath}`)
