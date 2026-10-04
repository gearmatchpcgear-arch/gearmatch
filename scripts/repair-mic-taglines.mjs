/**
 * Repair multiline-broken tagline strings in lib mic blocks using microphones_extracted.xlsx
 * Usage: npx tsx scripts/repair-mic-taglines.mjs
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import XLSX from "xlsx"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, "..")
const LIB = path.join(ROOT, "lib")
const XLSX_PATH = path.join(ROOT, "microphones_extracted.xlsx")

function sanitizeTsString(value) {
  return String(value)
    .replace(/\r\n/g, " ")
    .replace(/[\r\n]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

const wb = XLSX.readFile(XLSX_PATH)
const ws = wb.Sheets[wb.SheetNames[0]]
const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" }).slice(1)
const taglines = new Map(
  rows
    .filter((r) => r[0] && r[2])
    .map((r) => [String(r[0]).trim(), sanitizeTsString(r[2])]),
)

let total = 0
for (const file of fs.readdirSync(LIB)) {
  if (!file.endsWith(".ts")) continue
  const filePath = path.join(LIB, file)
  let src = fs.readFileSync(filePath, "utf8")
  if (!src.includes('category: "mic"')) continue

  let fileFixed = 0
  const blockRe = /\{[\s\S]*?id: "([^"]+)"[\s\S]*?category: "mic"[\s\S]*?\n  \}(?:,|\n)/g

  src = src.replace(blockRe, (block, id) => {
    const tagline = taglines.get(id)
    if (!tagline) return block
    const multilineRe = /tagline: "[\s\S]*?",\n(?=    (?:price:|rating:|listPrice:|image:))/
    if (!multilineRe.test(block) && !block.includes("\n", block.indexOf("tagline:"))) {
      return block
    }
    const safe = tagline.replace(/\\/g, "\\\\").replace(/"/g, '\\"')
    const next = block.replace(
      /tagline: "[\s\S]*?",\n(?=    (?:price:|rating:|listPrice:|image:))/,
      `tagline: "${safe}",\n`,
    )
    if (next !== block) fileFixed++
    return next
  })

  if (fileFixed > 0) {
    fs.writeFileSync(filePath, src)
    console.log(`${file}: ${fileFixed} taglines repaired`)
    total += fileFixed
  }
}

console.log(`Total repaired: ${total}`)
