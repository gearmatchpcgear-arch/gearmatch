/**
 * かんたんリンク / アフィリエイト URL を data/moshimo-cardlinks.json にマージ。
 *
 * CSV 列（1行目ヘッダー）:
 * - ID … 必須（gadget.id）
 * - affiliatePurchaseUrl … 任意（もしも等の直接リンク）
 * - moshimo_cardlink_json … 任意（msmaflink({...}) の JSON 全文。1行に収める）
 *
 * Usage: npm run import:moshimo -- path/to/import.csv
 * Template: data/moshimo-cardlinks.import.template.csv
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const dataPath = path.join(root, "data", "moshimo-cardlinks.json")

function parseCsv(text) {
  const rows = []
  let row = []
  let cell = ""
  let inQuotes = false

  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    const next = text[i + 1]

    if (inQuotes) {
      if (ch === '"' && next === '"') {
        cell += '"'
        i++
      } else if (ch === '"') {
        inQuotes = false
      } else {
        cell += ch
      }
      continue
    }

    if (ch === '"') {
      inQuotes = true
      continue
    }

    if (ch === ",") {
      row.push(cell)
      cell = ""
      continue
    }

    if (ch === "\n" || (ch === "\r" && next === "\n")) {
      row.push(cell)
      rows.push(row)
      row = []
      cell = ""
      if (ch === "\r") i++
      continue
    }

    if (ch === "\r") continue
    cell += ch
  }

  if (cell.length > 0 || row.length > 0) {
    row.push(cell)
    rows.push(row)
  }

  return rows
}

function loadDataFile() {
  if (!fs.existsSync(dataPath)) {
    return {
      version: 1,
      cardLinksByGadgetId: {},
      affiliatePurchaseUrlByGadgetId: {},
      cardLinksByAsin: {},
    }
  }
  return JSON.parse(fs.readFileSync(dataPath, "utf8"))
}

const csvPath = process.argv[2]
if (!csvPath) {
  console.error("Usage: npm run import:moshimo -- <csv-path>")
  process.exit(1)
}

const raw = fs.readFileSync(path.resolve(csvPath), "utf8").replace(/^\uFEFF/, "")
const table = parseCsv(raw)
if (table.length < 2) {
  console.error("CSV にデータ行がありません")
  process.exit(1)
}

const headers = table[0].map((h) => h.trim())
const idx = (name) => {
  const i = headers.indexOf(name)
  if (i < 0) {
    console.error(`必須列 "${name}" がありません。ヘッダー: ${headers.join(", ")}`)
    process.exit(1)
  }
  return i
}

const idCol = idx("ID")
const affiliateCol = headers.indexOf("affiliatePurchaseUrl")
const jsonCol = headers.indexOf("moshimo_cardlink_json")

const data = loadDataFile()
data.cardLinksByGadgetId = data.cardLinksByGadgetId ?? {}
data.affiliatePurchaseUrlByGadgetId = data.affiliatePurchaseUrlByGadgetId ?? {}
data.cardLinksByAsin = data.cardLinksByAsin ?? {}

let linked = 0
let affiliateOnly = 0

for (let r = 1; r < table.length; r++) {
  const row = table[r]
  const gadgetId = row[idCol]?.trim()
  if (!gadgetId) continue

  if (affiliateCol >= 0) {
    const aff = row[affiliateCol]?.trim()
    if (aff) {
      data.affiliatePurchaseUrlByGadgetId[gadgetId] = aff
      affiliateOnly++
    }
  }

  if (jsonCol >= 0) {
    const jsonText = row[jsonCol]?.trim()
    if (jsonText) {
      try {
        const config = JSON.parse(jsonText)
        if (!config.eid || !config.b_l || !config.u) {
          throw new Error("eid / b_l / u が不足")
        }
        data.cardLinksByGadgetId[gadgetId] = config
        linked++
      } catch (err) {
        console.error(`行 ${r + 1} (${gadgetId}): JSON 解析失敗 — ${err.message}`)
        process.exit(1)
      }
    }
  }
}

fs.writeFileSync(dataPath, `${JSON.stringify(data, null, 2)}\n`, "utf8")
console.log(`Updated ${dataPath}`)
console.log(`  cardlink configs: +${linked} (total ${Object.keys(data.cardLinksByGadgetId).length})`)
console.log(`  affiliate URLs: ${Object.keys(data.affiliatePurchaseUrlByGadgetId).length} entries`)
