/**
 * Export keyboard category gadgets to keyboard_gadgets.csv (project root).
 * Usage: npx tsx scripts/export-keyboard-gadgets-csv.mjs
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { allSourceGadgets, formatPrice, getGadgetConnectionDisplay } from "../lib/gadgets.ts"
import {
  getKeyboardInternalStructure,
  getKeyboardKeycaps,
  getKeyboardLayout,
  getKeyboardPower,
} from "../lib/keyboard-filter-tags.ts"
import {
  getKeyboardLayoutArray,
  getKeyboardPollingRate,
  getKeyboardSpreadsheetFeatures,
  getKeyboardSpreadsheetGaming,
  getKeyboardSpreadsheetRapidTrigger,
} from "../lib/keyboard-spreadsheet-tags.ts"

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const outPath = path.join(root, "keyboard_gadgets.csv")

const HEADERS = [
  "id",
  "brand",
  "name",
  "fullTitle",
  "レイアウト",
  "内部構造",
  "キーキャップ",
  "接続方式",
  "電源",
  "価格",
  "げーミンクキーボードか",
  "ポーリングレート",
  "ラピッドトリガー搭載か",
  "配列",
  "特徴",
]

const MISSING = "未記載"

function display(value) {
  if (value == null) return MISSING
  const t = String(value).trim()
  if (!t || t === "—" || t === "-") return MISSING
  return t
}

function displayBrand(brand) {
  if (!brand || brand.trim() === "—") return MISSING
  return brand.trim()
}

function displayPrice(price) {
  if (price == null || !Number.isFinite(price)) return MISSING
  return formatPrice(price)
}

function displayGaming(gadget) {
  const gaming = getKeyboardSpreadsheetGaming(gadget)
  if (gaming === true) return "ゲーミングキーボード"
  return MISSING
}

function displayRapidTrigger(gadget) {
  const rt = getKeyboardSpreadsheetRapidTrigger(gadget)
  if (rt === true) return "ラピッドトリガー"
  return MISSING
}

function csvCell(value) {
  const text = value == null ? MISSING : String(value)
  if (/[",\r\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`
  }
  return text
}

function row(values) {
  return values.map(csvCell).join(",")
}

const keyboardGadgets = allSourceGadgets
  .filter((g) => g.category === "keyboard")
  .sort((a, b) => {
    const brandCmp = a.brand.localeCompare(b.brand, "ja")
    if (brandCmp !== 0) return brandCmp
    return a.name.localeCompare(b.name, "ja")
  })

const lines = [row(HEADERS)]

for (const gadget of keyboardGadgets) {
  const features = getKeyboardSpreadsheetFeatures(gadget)
  lines.push(
    row([
      gadget.id,
      displayBrand(gadget.brand),
      gadget.name,
      gadget.tagline || MISSING,
      display(getKeyboardLayout(gadget)),
      display(getKeyboardInternalStructure(gadget)),
      display(getKeyboardKeycaps(gadget)),
      display(getGadgetConnectionDisplay(gadget)),
      display(getKeyboardPower(gadget)),
      displayPrice(gadget.price),
      displayGaming(gadget),
      display(getKeyboardPollingRate(gadget)),
      displayRapidTrigger(gadget),
      display(getKeyboardLayoutArray(gadget)),
      features.length > 0 ? features.join(" / ") : MISSING,
    ]),
  )
}

fs.writeFileSync(outPath, `\uFEFF${lines.join("\n")}\n`, "utf8")

console.log(`Wrote ${keyboardGadgets.length} keyboard rows to ${outPath}`)
