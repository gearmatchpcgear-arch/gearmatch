/**
 * Sync existing monitor-arm gadgets from monitor_arms.csv (update only — no new cards).
 * Usage: npx tsx scripts/sync-monitor-arm-from-spreadsheet.mjs [csvPath]
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { allSourceGadgets } from "../lib/gadgets.ts"
import {
  formatMonitorArmCountLabel,
  normalizeMonitorArmSpreadsheetArmType,
} from "../lib/monitor-arm-spreadsheet-tags.ts"
import { DASH } from "./spec-display-normalize.mjs"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, "..")
const DEFAULT_CSV = "D:/ダウンロード/monitor_arms.csv"
const CSV_PATH = process.argv[2] ?? DEFAULT_CSV

const ARM_IDS = new Set(
  allSourceGadgets.filter((g) => g.category === "monitor-arm").map((g) => g.id),
)

function parseCsv(text) {
  const rows = []
  let row = []
  let cur = ""
  let inQ = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (inQ) {
      if (c === '"' && text[i + 1] === '"') {
        cur += '"'
        i++
      } else if (c === '"') inQ = false
      else cur += c
    } else if (c === '"') inQ = true
    else if (c === ",") {
      row.push(cur)
      cur = ""
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++
      row.push(cur)
      cur = ""
      if (row.some((cell) => cell.trim())) rows.push(row)
      row = []
    } else cur += c
  }
  if (cur || row.length) {
    row.push(cur)
    if (row.some((cell) => cell.trim())) rows.push(row)
  }
  return rows
}

function isMissing(value) {
  if (value == null) return true
  const t = String(value).trim()
  return !t || t === "-" || t === "—"
}

function norm(text) {
  return String(text ?? "")
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[\s　]+/g, "")
    .replace(/[（）()]/g, "")
}

function tokenize(text) {
  return String(text ?? "")
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^a-z0-9\u3040-\u9fff]+/g, " ")
    .split(/\s+/)
    .filter((t) => t.length >= 2)
}

function parsePrice(raw) {
  if (isMissing(raw)) return null
  const n = Number(String(raw).replace(/[,，]/g, ""))
  return Number.isFinite(n) ? n : null
}

function displayValue(raw) {
  if (isMissing(raw)) return DASH
  return raw.trim()
}

function cleanseRow(cols) {
  const [
    name,
    description,
    price,
    screenSize,
    loadCapacity,
    vesa,
    mountType,
    driveType,
    armTypeRaw,
  ] = cols

  const armType = normalizeMonitorArmSpreadsheetArmType(armTypeRaw)

  return {
    name: name?.trim() ?? "",
    description: description?.trim().replace(/[\r\n]+/g, " ").replace(/\s+/g, " ") ?? "",
    price: parsePrice(price),
    screenSize: displayValue(screenSize),
    loadCapacity: displayValue(loadCapacity),
    vesa: displayValue(vesa),
    mountType: displayValue(mountType),
    driveType: displayValue(driveType),
    armType,
    armCount: formatMonitorArmCountLabel(armType),
  }
}

function loadCsvRows() {
  const text = fs.readFileSync(CSV_PATH, "utf8").replace(/^\uFEFF/, "")
  const parsed = parseCsv(text.trim())
  return parsed.slice(1).map(cleanseRow)
}

function modelKeys(gadget) {
  const keys = new Set()
  keys.add(norm(gadget.name))
  if (gadget.brand && gadget.brand !== "—") keys.add(norm(gadget.brand))

  for (const token of tokenize(`${gadget.name} ${gadget.brand}`)) {
    if (token.length >= 3 && !/モニター|アーム|monitor|arm/i.test(token)) {
      keys.add(token)
    }
  }

  for (const match of `${gadget.name} ${gadget.tagline}`.match(/[a-z0-9]{3,}/gi) ?? []) {
    keys.add(norm(match))
  }

  return keys
}

function scoreMatch(gadget, row) {
  const csvHay = norm(`${row.name} ${row.description}`)
  let score = 0

  const gName = norm(gadget.name)
  const rName = norm(row.name)

  if (gName && rName && gName === rName) score += 120
  if (gName.length >= 4 && rName.includes(gName)) score += 80
  if (rName.length >= 4 && gName.includes(rName)) score += 70

  if (gadget.brand && gadget.brand !== "—" && csvHay.includes(norm(gadget.brand))) score += 25

  if (gadget.price != null && row.price != null && gadget.price === row.price) score += 40

  for (const key of modelKeys(gadget)) {
    if (key.length >= 3 && csvHay.includes(key)) score += 14
  }

  const tagWords = tokenize(gadget.tagline).filter((w) => w.length >= 4)
  let tagHits = 0
  for (const w of tagWords) {
    if (csvHay.includes(w)) tagHits++
  }
  score += Math.min(tagHits * 4, 20)

  return score
}

const MANUAL_GADGET_ROW_PICKERS = {
  "arm-bs-001": (row) =>
    norm(row.name).includes("ergear") &&
    row.price === 3399 &&
    norm(row.description).includes("ポール"),
  "arm-bs-009": (row) => row.price === 2960 && norm(row.name).includes("mountup"),
  "arm-bs-011": (row) => row.price === 2899 && norm(row.name).includes("mountup"),
  "arm-bs-012": (row) => row.price === 3280 && norm(row.name).includes("theark"),
  "arm-bs-057": (row) => row.name.includes("ZJ35-02"),
  "arm-bs-059": (row) => norm(row.name).includes("tasavz") && row.price === 3980,
  "arm-bs-075": (row) => row.name.includes("100-LAC003") && row.price === 2099,
  "arm-bs-076": (row) => row.name.includes("100-LAC003") && row.price === 4980,
  "arm-bs-999": (row) => row.name.includes("DPA-SS09"),
  "arm-sr-003": (row) =>
    norm(row.name).includes("amazonベーシック") && row.price === 2977,
  "arm-sr-013": (row) => row.price === 2960 && norm(row.name).includes("ergear"),
  "arm-sr-105": (row) => row.price === 2899 && norm(row.description).includes("ポール取り付け"),
  "arm-sr-1058": (row) => row.price === 5414 && norm(row.name).includes("ergear"),
  "arm-nr-08": (row) => row.price === 9980 && row.name.includes("AS-MABG06D"),
  "arm-nr-20": (row) => norm(row.name).includes("ma6s") && row.price === 6280,
  "arm-nr-23": (row) => row.price === 8990 && norm(row.name).includes("pegzone"),
  "arm-nr2-53": (row) => norm(row.name).includes("ethu"),
  "arm-nr2-57": (row) => row.name.includes("AS-MABE01") && row.price === 3580,
  "arm-nr2-58": (row) => row.price === 3180 && norm(row.name).includes("eex-lafs01bk"),
}

/** 同一商品の重複カード — ソース側の CSV 行を共有 */
const SHARED_ROW_FROM = {
  "arm-bs-053": "arm-sr-003",
  "arm-nr-04": "arm-bs-059",
  "arm-nr-19": "arm-nr-20",
  "arm-nr2-56": "arm-nr2-57",
}

function applySharedRows(mapping) {
  for (const [targetId, sourceId] of Object.entries(SHARED_ROW_FROM)) {
    if (mapping.has(targetId)) continue
    const source = mapping.get(sourceId)
    if (source) mapping.set(targetId, { row: source.row, score: source.score })
  }
}

function assignRowsToGadgets(gadgets, rows) {
  const mapping = new Map()
  const assignedGadgets = new Set()
  const assignedRows = new Set()

  for (const gadget of gadgets) {
    const picker = MANUAL_GADGET_ROW_PICKERS[gadget.id]
    if (!picker) continue
    const picked = rows
      .map((row, rowIndex) => ({ row, rowIndex }))
      .find(({ row, rowIndex }) => !assignedRows.has(rowIndex) && picker(row))
    if (picked) {
      mapping.set(gadget.id, { row: picked.row, score: 250 })
      assignedGadgets.add(gadget.id)
      assignedRows.add(picked.rowIndex)
    }
  }

  for (const gadget of gadgets) {
    const gName = norm(gadget.name)
    if (gName.length < 3) continue
    const exactRows = rows
      .map((row, rowIndex) => ({ row, rowIndex }))
      .filter(({ row, rowIndex }) => !assignedRows.has(rowIndex) && norm(row.name) === gName)

    let picked = null
    if (exactRows.length === 1) {
      picked = exactRows[0]
    } else if (exactRows.length > 1 && gadget.price != null) {
      const byPrice = exactRows.filter(({ row }) => row.price === gadget.price)
      if (byPrice.length === 1) picked = byPrice[0]
    }

    if (picked) {
      mapping.set(gadget.id, { row: picked.row, score: 200 })
      assignedGadgets.add(gadget.id)
      assignedRows.add(picked.rowIndex)
    }
  }

  const pairs = []
  for (const gadget of gadgets) {
    if (assignedGadgets.has(gadget.id)) continue
    for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
      if (assignedRows.has(rowIndex)) continue
      const score = scoreMatch(gadget, rows[rowIndex])
      if (score >= 55) pairs.push({ gadget, rowIndex, score })
    }
  }
  pairs.sort((a, b) => b.score - a.score)

  for (const { gadget, rowIndex, score } of pairs) {
    if (assignedGadgets.has(gadget.id) || assignedRows.has(rowIndex)) continue
    assignedGadgets.add(gadget.id)
    assignedRows.add(rowIndex)
    mapping.set(gadget.id, { row: rows[rowIndex], score })
  }

  const remainingGadgets = gadgets.filter((g) => !assignedGadgets.has(g.id))
  const remainingRowIndexes = rows.map((_, i) => i).filter((i) => !assignedRows.has(i))

  for (const gadget of remainingGadgets) {
    if (gadget.price == null) continue
    const priceMatches = remainingRowIndexes.filter((i) => rows[i].price === gadget.price)
    if (priceMatches.length !== 1) continue
    const rowIndex = priceMatches[0]
    mapping.set(gadget.id, { row: rows[rowIndex], score: 40 })
    assignedGadgets.add(gadget.id)
    assignedRows.add(rowIndex)
    const idx = remainingRowIndexes.indexOf(rowIndex)
    if (idx >= 0) remainingRowIndexes.splice(idx, 1)
  }

  applySharedRows(mapping)
  return mapping
}

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

function replaceScalarField(block, field, formatter) {
  const re = new RegExp(`(${field}: )([^,\\n]+)`, "m")
  const m = block.match(re)
  if (!m) return { block, changed: false }
  const nextVal = formatter(m[2])
  if (nextVal === m[2]) return { block, changed: false }
  return { block: block.replace(re, `$1${nextVal}`), changed: true }
}

function replaceQuotedField(block, field, value) {
  const re = new RegExp(`(${field}: ")([^"]*)(")`)
  if (!re.test(block)) return { block, changed: false }
  const next = block.replace(re, `$1${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}$3`)
  return { block: next, changed: next !== block }
}

function ensureQuotedField(block, field, value) {
  const escaped = value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')
  if (new RegExp(`\\b${field}:`).test(block)) {
    return replaceQuotedField(block, field, value)
  }
  if (block.includes("connection:")) {
    const next = block.replace(/(    connection: "[^"]*",\n)/, `$1    ${field}: "${escaped}",\n`)
    return { block: next, changed: true }
  }
  if (block.includes("purchaseUrl:")) {
    const next = block.replace(/(    purchaseUrl: "[^"]*",\n)/, `$1    ${field}: "${escaped}",\n`)
    return { block: next, changed: true }
  }
  return { block, changed: false }
}

function replaceHighlightField(block, label, value) {
  const display = value ?? DASH
  const re = new RegExp(`(\\{ label: "${escapeRegExp(label)}", value: ")([^"]*)(" \\})`, "g")
  if (!re.test(block)) return { block, changed: false }
  const next = block.replace(re, `$1${display.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}$3`)
  return { block: next, changed: next !== block }
}

function replaceSpecField(block, label, value) {
  const display = value ?? DASH
  const re = new RegExp(`(\\{ label: "${escapeRegExp(label)}", value: ")([^"]*)(" \\})`, "g")
  const specStart = block.indexOf("specGroups:")
  if (specStart === -1) return { block, changed: false }
  const head = block.slice(0, specStart)
  const tail = block.slice(specStart)
  if (!tail.includes(`label: "${label}"`)) return { block, changed: false }
  const newTail = tail.replace(re, `$1${display.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}$3`)
  if (newTail === tail) return { block, changed: false }
  return { block: head + newTail, changed: true }
}

function updateBlock(block, row) {
  let next = block
  let changed = false

  const apply = (result) => {
    next = result.block
    if (result.changed) changed = true
  }

  if (row.price != null) {
    apply(replaceScalarField(next, "price", () => String(row.price)))
  }

  if (row.name) {
    apply(replaceQuotedField(next, "name", row.name))
  }

  if (row.description) {
    apply(replaceQuotedField(next, "tagline", row.description))
  }

  if (row.mountType && row.mountType !== DASH) {
    apply(replaceQuotedField(next, "connection", row.mountType))
  }

  apply(ensureQuotedField(next, "monitorArmSpreadsheetArmType", row.armType))

  apply(replaceHighlightField(next, "対応サイズ", row.screenSize))
  apply(replaceHighlightField(next, "耐荷重", row.loadCapacity))
  apply(replaceHighlightField(next, "VESA", row.vesa))
  apply(replaceHighlightField(next, "取付方式", row.mountType))

  const specFields = [
    ["画面サイズ", row.screenSize],
    ["耐荷重", row.loadCapacity],
    ["VESA", row.vesa],
    ["取付方式", row.mountType],
    ["駆動方式", row.driveType],
    ["アーム数", row.armCount],
  ]

  for (const [label, value] of specFields) {
    apply(replaceSpecField(next, label, value))
  }

  return { block: next, changed }
}

function applyToFile(filePath, mapping) {
  let src = fs.readFileSync(filePath, "utf8")
  if (!src.includes('category: "monitor-arm"')) return 0

  let updated = 0
  const blockRe = /\{[\s\S]*?id: "([^"]+)"[\s\S]*?category: "monitor-arm"[\s\S]*?\n  \}(?:,|\n)/g

  src = src.replace(blockRe, (block, id) => {
    if (!ARM_IDS.has(id)) return block
    const entry = mapping.get(id)
    if (!entry) return block
    const { block: next, changed } = updateBlock(block, entry.row)
    if (changed) updated++
    return next
  })

  if (updated > 0) fs.writeFileSync(filePath, src)
  return updated
}

const gadgets = allSourceGadgets.filter((g) => g.category === "monitor-arm")
const rows = loadCsvRows()
const mapping = assignRowsToGadgets(gadgets, rows)

console.log(`CSV: ${CSV_PATH}`)
console.log(`CSV rows: ${rows.length}, monitor-arm gadgets: ${gadgets.length}`)
console.log(`Matched: ${mapping.size}`)

const unmatched = gadgets.filter((g) => !mapping.has(g.id))
if (unmatched.length > 0) {
  console.log(`Unmatched gadgets (${unmatched.length}):`)
  for (const g of unmatched) console.log(`  ${g.id} ${g.name}`)
}

const unmatchedRows = rows.filter((_, i) => ![...mapping.values()].some((v) => v.row === rows[i]))
if (unmatchedRows.length > 0) {
  console.log(`Unmatched CSV rows (${unmatchedRows.length}):`)
  for (const r of unmatchedRows.slice(0, 10)) console.log(`  ${r.name}`)
}

let total = 0
for (const file of fs.readdirSync(path.join(ROOT, "lib"))) {
  if (!file.endsWith(".ts")) continue
  const count = applyToFile(path.join(ROOT, "lib", file), mapping)
  if (count > 0) {
    console.log(`${file}: ${count} blocks updated`)
    total += count
  }
}

console.log(`Total updated: ${total}`)
