/**
 * Export guide mouse recommendation cards (lib + display order) to CSV.
 * Does not modify card source data.
 * Usage: npx tsx scripts/export-guide-mouse-cards-csv.mjs
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import {
  GUIDE_MOUSE_BEGINNER_HYPERX,
  GUIDE_MOUSE_BEGINNER_UPGRADE,
  GUIDE_MOUSE_OFFICE_M750,
  GUIDE_MOUSE_OFFICE_MX_MASTER_3S,
  GUIDE_MOUSE_OFFICE_TECKNET,
  GUIDE_MOUSE_PRO_G502,
  GUIDE_MOUSE_PRO_SUPERSTRIKE,
  GUIDE_MOUSE_RECOMMENDATIONS,
  GUIDE_MOUSE_TABS,
} from "../lib/guide-mouse-recommendations.ts"
import { gadgets } from "../lib/gadgets.ts"
import { resolveGuidePriceLabel } from "../lib/guide-price-label.ts"

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const outPath = path.join(root, "guide_mouse_cards.csv")

const HEADERS = [
  "用途タブID",
  "用途タブ名",
  "表示順",
  "カードキー",
  "バッジ",
  "gadgetId",
  "商品名",
  "型番",
  "価格表示",
  "選定見出し",
  "重量",
  "接続",
  "センサー",
  "感度",
  "ボタン数",
  "バッテリー",
  "選定理由",
]

function csvCell(value) {
  const text = value == null ? "" : String(value)
  if (/[",\r\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`
  }
  return text
}

function row(values) {
  return values.map(csvCell).join(",")
}

function resolveGadget(gadgetId) {
  return gadgets.find((g) => g.id === gadgetId)
}

function formatReasons(reasons) {
  if (!reasons?.length) return ""
  return reasons
    .map((reason) => {
      if (typeof reason === "string") return reason
      const tone = reason.tone ? ` [${reason.tone}]` : ""
      return `${reason.emphasis}${tone} ${reason.text}`.trim()
    })
    .join("\n")
}

function pickSpecs(specs) {
  if (!specs) return { weight: "", connection: "", sensor: "", sensitivity: "", buttons: "", battery: "" }
  return {
    weight: specs.weight ?? "",
    connection: specs.connection ?? "",
    sensor: specs.sensor ?? "",
    sensitivity: specs.sensitivity ?? "",
    buttons: specs.buttons ?? "",
    battery: specs.battery ?? "",
  }
}

function cardRow({ tabId, tabLabel, order, cardKey, item, descriptionHeading }) {
  const gadget = resolveGadget(item.gadgetId)
  const specs = pickSpecs(item.specs)
  const heading =
    descriptionHeading ??
    item.reasonsHeading ??
    item.heading ??
    "なぜこのマウスがおすすめなのか？"

  return row([
    tabId,
    tabLabel,
    order,
    cardKey,
    item.badge ?? "",
    item.gadgetId ?? "",
    item.title ?? "",
    item.modelNumber ?? "",
    resolveGuidePriceLabel(gadget, item.priceLabel, "価格はAmazonでご確認ください"),
    heading,
    specs.weight,
    specs.connection,
    specs.sensor,
    specs.sensitivity,
    specs.buttons,
    specs.battery,
    formatReasons(item.reasons),
  ])
}

const tabLabel = (id) => GUIDE_MOUSE_TABS.find((t) => t.id === id)?.label ?? id

const rows = []

const beginner = GUIDE_MOUSE_RECOMMENDATIONS.find((r) => r.id === "beginner")
const pro = GUIDE_MOUSE_RECOMMENDATIONS.find((r) => r.id === "pro")

rows.push(
  cardRow({
    tabId: "beginner",
    tabLabel: tabLabel("beginner"),
    order: 1,
    cardKey: "beginner-primary",
    item: beginner,
  }),
  cardRow({
    tabId: "beginner",
    tabLabel: tabLabel("beginner"),
    order: 2,
    cardKey: "beginner-upgrade",
    item: GUIDE_MOUSE_BEGINNER_UPGRADE,
    descriptionHeading: "予算に余裕があるなら「これを選んでおけば間違いなし」の最高峰",
  }),
  cardRow({
    tabId: "beginner",
    tabLabel: tabLabel("beginner"),
    order: 3,
    cardKey: "beginner-hyperx",
    item: GUIDE_MOUSE_BEGINNER_HYPERX,
  }),
  cardRow({
    tabId: "pro",
    tabLabel: tabLabel("pro"),
    order: 1,
    cardKey: "pro-primary",
    item: pro,
  }),
  cardRow({
    tabId: "pro",
    tabLabel: tabLabel("pro"),
    order: 2,
    cardKey: "pro-superstrike",
    item: GUIDE_MOUSE_PRO_SUPERSTRIKE,
  }),
  cardRow({
    tabId: "pro",
    tabLabel: tabLabel("pro"),
    order: 3,
    cardKey: "pro-g502",
    item: GUIDE_MOUSE_PRO_G502,
  }),
  cardRow({
    tabId: "office",
    tabLabel: tabLabel("office"),
    order: 1,
    cardKey: "office-tecknet",
    item: GUIDE_MOUSE_OFFICE_TECKNET,
  }),
  cardRow({
    tabId: "office",
    tabLabel: tabLabel("office"),
    order: 2,
    cardKey: "office-m750",
    item: GUIDE_MOUSE_OFFICE_M750,
  }),
  cardRow({
    tabId: "office",
    tabLabel: tabLabel("office"),
    order: 3,
    cardKey: "office-mx-master-3s",
    item: GUIDE_MOUSE_OFFICE_MX_MASTER_3S,
  }),
)

const bom = "\uFEFF"
const body = [row(HEADERS), ...rows].join("\r\n") + "\r\n"
fs.writeFileSync(outPath, bom + body, "utf8")
console.log(`Wrote ${rows.length} cards to ${outPath}`)
