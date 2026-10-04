/**
 * 一覧表示と同じゲーミングチェアを CSV 出力（Amazon URL・画像 URL は含めない）
 *
 * Usage: npx tsx scripts/export-chairs-csv.mjs [outPath]
 * Default: exported_gaming_chairs_185.csv（プロジェクトルート）
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import {
  filterGadgetsByCategory,
  gadgets,
  getDisplayPrice,
  getDisplayRating,
  getDisplayReviewCount,
  getListableGadgets,
  hasDisplayReviews,
  UNSPECIFIED_SPEC,
} from "../lib/gadgets.ts"
import { formatDimensions } from "../lib/gaming-chair-dimension-display.ts"
import {
  formatGamingChairCsvOttoman,
  getGamingChairCsvRow,
  isGamingChairListedInCsv,
  withGamingChairCsvOverlay,
} from "../lib/gaming-chairs-csv-data.ts"
import {
  gamingChairHasOttoman,
  getGamingChairMaterial,
  getGamingChairMaxRecliningAngle,
  getGamingChairStyle,
} from "../lib/gaming-chair-filter-tags.ts"
import { formatShapeLabel } from "../lib/gaming-chair-shape-display.ts"

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const outPath = process.argv[2] ?? path.join(root, "exported_gaming_chairs_185.csv")

const HEADERS = [
  "商品名称",
  "ブランド名",
  "価格",
  "評価",
  "レビュー件数",
  "素材",
  "最大リクライニング角度",
  "寸法（W×D×H）",
  "オットマン",
  "背もたれ幅",
  "形状",
]

function normalizeField(value) {
  if (value === null || value === undefined) return ""
  const text = String(value).trim()
  if (!text || text === UNSPECIFIED_SPEC || text === "—" || text === "-") return ""
  return text
}

function csvCell(value) {
  const text = normalizeField(value)
  if (text === "") return '""'
  if (/[",\r\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`
  }
  return text
}

function csvNumber(value) {
  if (value === null || value === undefined || value === "") return ""
  const n = Number(value)
  return Number.isFinite(n) ? String(n) : ""
}

function row(values) {
  return values.map((v) => (typeof v === "number" ? csvNumber(v) : csvCell(v))).join(",")
}

function ottomanForExport(gadget, csvRow) {
  if (csvRow?.ottoman) {
    const formatted = formatGamingChairCsvOttoman(csvRow.ottoman)
    if (formatted !== UNSPECIFIED_SPEC) return formatted
  }
  if (typeof gadget.hasOttoman === "boolean") {
    return gadget.hasOttoman ? "あり" : "なし"
  }
  return gamingChairHasOttoman(gadget) ? "あり" : "なし"
}

function buildExportRow(gadget) {
  const display = withGamingChairCsvOverlay(gadget)
  const csvRow = getGamingChairCsvRow(gadget.id)

  const price = getDisplayPrice(display) ?? csvRow?.price ?? display.price
  const rating = hasDisplayReviews(display) ? getDisplayRating(display) : ""
  const reviewCount = hasDisplayReviews(display) ? getDisplayReviewCount(display) : ""

  const material =
    normalizeField(csvRow?.material) || normalizeField(getGamingChairMaterial(gadget))
  const reclining =
    normalizeField(csvRow?.maxReclining) ||
    normalizeField(getGamingChairMaxRecliningAngle(gadget))
  const dimensions = csvRow
    ? formatDimensions(csvRow.dimensions)
    : formatDimensions(gadget.dimensions ?? "")
  const dimensionsDisplay =
    dimensions === "-" || dimensions === UNSPECIFIED_SPEC ? "" : dimensions

  const backrestWidth = normalizeField(csvRow?.backrestWidth ?? "")
  const rawShape = normalizeField(csvRow?.shape)
  const shape = rawShape
    ? formatShapeLabel(rawShape)
    : normalizeField(getGamingChairStyle(gadget))

  return row([
    display.name,
    display.brand,
    price ?? "",
    rating,
    reviewCount,
    material || "-",
    reclining || "-",
    dimensionsDisplay || "-",
    ottomanForExport(gadget, csvRow),
    backrestWidth || "-",
    shape || "-",
  ])
}

const chairs = filterGadgetsByCategory(getListableGadgets(gadgets, false), "gaming-chair")
  .filter(isGamingChairListedInCsv)
  .sort((a, b) => a.id.localeCompare(b.id))

const lines = [HEADERS.join(","), ...chairs.map(buildExportRow)]
fs.writeFileSync(outPath, `\uFEFF${lines.join("\n")}\n`, "utf8")

console.log(`Successfully exported ${chairs.length} items to ${outPath}`)
