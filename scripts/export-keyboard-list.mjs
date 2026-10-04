/**
 * Export all keyboard gadgets in a human-readable list format.
 * Usage: npx tsx scripts/export-keyboard-list.mjs [outPath]
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

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const outPath = process.argv[2] ?? path.join(root, "keyboard-export.txt")

function display(value) {
  if (value == null) return "未記載"
  const t = String(value).trim()
  if (!t || t === "—" || t === "-") return "未記載"
  return t
}

function displayBrand(brand) {
  if (!brand || brand.trim() === "—") return "未記載"
  return brand.trim()
}

function displayPrice(price) {
  if (price == null || !Number.isFinite(price)) return "未記載"
  return formatPrice(price)
}

const keyboards = allSourceGadgets
  .filter((g) => g.category === "keyboard")
  .sort((a, b) => {
    const brandCmp = a.brand.localeCompare(b.brand, "ja")
    if (brandCmp !== 0) return brandCmp
    return a.name.localeCompare(b.name, "ja")
  })

const lines = []
for (const g of keyboards) {
  lines.push(`■ 商品名: ${g.name}`)
  lines.push(`- ブランド: ${displayBrand(g.brand)}`)
  lines.push(`- レイアウト: ${display(getKeyboardLayout(g))}`)
  lines.push(`- 内部構造: ${display(getKeyboardInternalStructure(g))}`)
  lines.push(`- キーキャップ: ${display(getKeyboardKeycaps(g))}`)
  lines.push(`- 接続方式: ${display(getGadgetConnectionDisplay(g))}`)
  lines.push(`- 電源: ${display(getKeyboardPower(g))}`)
  lines.push(`- 価格: ${displayPrice(g.price)}`)
  lines.push("")
}

fs.writeFileSync(outPath, `${lines.join("\n")}\n`, "utf8")
console.log(`Wrote ${keyboards.length} keyboards to ${outPath}`)
