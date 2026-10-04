/**
 * Export monitor-arm category gadgets to monitor_arms.csv (project root).
 * Usage: npx tsx scripts/export-monitor-arms-csv.mjs
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { allSourceGadgets, getCardHighlights, UNSPECIFIED_SPEC } from "../lib/gadgets.ts"
import { getMonitorArmArmType } from "../lib/monitor-arm-spreadsheet-tags.ts"

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const outPath = path.join(root, "monitor_arms.csv")
const MISSING = "-"

const HEADERS = [
  "商品名",
  "商品説明",
  "価格",
  "対応サイズ",
  "耐荷重",
  "VESA",
  "取付方式",
  "駆動方式",
  "アームタイプ",
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

function readLabeledValue(gadget, label) {
  for (const h of gadget.highlights) {
    if (h.label === label) {
      const value = normalizeField(h.value)
      if (value !== MISSING) return value
    }
  }
  for (const group of gadget.specGroups) {
    for (const specRow of group.rows) {
      if (specRow.label === label) {
        const value = normalizeField(specRow.value)
        if (value !== MISSING) return value
      }
    }
  }
  return null
}

function cardSpec(gadget, label) {
  const fromCard = getCardHighlights(gadget).find((h) => h.label === label)?.value
  const normalized = normalizeField(fromCard)
  return normalized === MISSING ? null : normalized
}

function getMonitorArmScreenSize(gadget) {
  return cardSpec(gadget, "対応サイズ") ?? readLabeledValue(gadget, "画面サイズ")
}

function getMonitorArmDriveType(gadget) {
  const fromSpec = readLabeledValue(gadget, "駆動方式")
  if (fromSpec) return fromSpec

  const tagline = gadget.tagline?.trim() ?? ""
  const lastSegment = tagline.split("・").pop()?.trim() ?? ""
  if (/スプリング式|固定式|ポール式/i.test(lastSegment)) {
    return lastSegment
  }

  return null
}

function getMonitorArmDescription(gadget) {
  const text = gadget.tagline?.trim()
  if (!text || text === UNSPECIFIED_SPEC || text === "—") return MISSING
  return text.replace(/[\r\n]+/g, " ").replace(/\s+/g, " ").trim()
}

function formatPrice(gadget) {
  if (gadget.price == null || Number.isNaN(gadget.price)) return MISSING
  return gadget.price
}

const monitorArms = allSourceGadgets.filter((g) => g.category === "monitor-arm")
const lines = [row(HEADERS)]

for (const gadget of monitorArms) {
  lines.push(
    row([
      gadget.name,
      getMonitorArmDescription(gadget),
      formatPrice(gadget),
      getMonitorArmScreenSize(gadget),
      cardSpec(gadget, "耐荷重") ?? readLabeledValue(gadget, "耐荷重"),
      cardSpec(gadget, "VESA") ?? readLabeledValue(gadget, "VESA"),
      cardSpec(gadget, "取付方式") ?? readLabeledValue(gadget, "取付方式"),
      getMonitorArmDriveType(gadget),
      getMonitorArmArmType(gadget),
    ]),
  )
}

fs.writeFileSync(outPath, `\uFEFF${lines.join("\n")}\n`, "utf8")

console.log(`Wrote ${monitorArms.length} monitor-arm rows to ${outPath}`)
