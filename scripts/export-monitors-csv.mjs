/**
 * Export listable monitor gadgets (same set as the app UI) to monitors.csv (project root).
 * Usage: npx tsx scripts/export-monitors-csv.mjs [outPath]
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
  getMonitorPanelDisplay,
  getMonitorResolutionDisplay,
} from "../lib/monitor-filter-tags.ts"
import { inferMonitorWeightKg } from "../lib/monitor-detail-specs.ts"
import { getMonitorVesaStandardDisplay } from "../lib/monitor-vesa-standard.ts"
import { normalizeMonitorRefreshDisplay } from "../lib/spec-display-normalize.ts"

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const outPath = process.argv[2] ?? path.join(root, "monitors.csv")
const MISSING = "-"

const HEADERS = [
  "ID",
  "名称",
  "商品説明",
  "価格",
  "画面サイズ",
  "解像度",
  "リフレッシュレート",
  "液晶パネルの種類",
  "VESA規格",
  "重量",
  "接続端子",
]

function normalizeField(value) {
  if (value === null || value === undefined) return MISSING
  const text = String(value).trim()
  if (!text || text === UNSPECIFIED_SPEC || text === "—" || text === "-") return MISSING
  return text
}

function normalizeVesaField(value) {
  const text = normalizeField(value)
  return text === MISSING ? UNSPECIFIED_SPEC : text
}

function csvCell(value) {
  if (value === UNSPECIFIED_SPEC) return UNSPECIFIED_SPEC
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

function getMonitorScreenSize(gadget) {
  const fromSpec = readLabeledValue(gadget, "画面サイズ")
  if (fromSpec) return fromSpec
  return MISSING
}

function getMonitorRefreshRate(gadget) {
  for (const h of gadget.highlights) {
    if (/リフレッシュ/i.test(h.label)) {
      return normalizeField(normalizeMonitorRefreshDisplay(h.value))
    }
  }
  for (const group of gadget.specGroups) {
    for (const specRow of group.rows) {
      if (specRow.label === "リフレッシュレート" || /リフレッシュ/i.test(specRow.label)) {
        return normalizeField(normalizeMonitorRefreshDisplay(specRow.value))
      }
    }
  }
  return MISSING
}

function getMonitorPorts(gadget) {
  const portGroup = gadget.specGroups.find((g) => /接続端子|端子|ポート/i.test(g.title))
  if (portGroup) {
    const parts = portGroup.rows
      .map((r) => {
        const value = normalizeField(r.value)
        if (value === MISSING) return null
        return `${r.label}: ${value}`
      })
      .filter(Boolean)
    if (parts.length > 0) return parts.join(" / ")
  }

  const connection = normalizeField(gadget.connection)
  if (connection !== MISSING) return connection

  return MISSING
}

function getMonitorDescription(gadget) {
  const text = gadget.tagline?.trim()
  if (!text || text === UNSPECIFIED_SPEC || text === "—") return MISSING
  return text.replace(/[\r\n]+/g, " ").replace(/\s+/g, " ").trim()
}

function formatPrice(gadget) {
  if (gadget.price == null || Number.isNaN(gadget.price)) return MISSING
  return gadget.price
}

const monitors = filterGadgetsByCategory(getListableGadgets(gadgets, false), "monitor")
const lines = [row(HEADERS)]

for (const gadget of monitors) {
  lines.push(
    row([
      gadget.id,
      gadget.name,
      getMonitorDescription(gadget),
      formatPrice(gadget),
      getMonitorScreenSize(gadget),
      normalizeField(getMonitorResolutionDisplay(gadget)),
      getMonitorRefreshRate(gadget),
      normalizeField(getMonitorPanelDisplay(gadget)),
      normalizeVesaField(getMonitorVesaStandardDisplay(gadget)),
      normalizeField(inferMonitorWeightKg(gadget)),
      getMonitorPorts(gadget),
    ]),
  )
}

fs.writeFileSync(outPath, `\uFEFF${lines.join("\n")}\n`, "utf8")

console.log(`Wrote ${monitors.length} monitor rows to ${outPath}`)
