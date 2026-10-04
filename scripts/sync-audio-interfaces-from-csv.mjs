/**
 * Sync existing audio-interface gadgets from audio_interfaces.csv (B–I + J tier).
 * Does NOT insert new gadget records.
 *
 * Usage:
 *   node scripts/sync-audio-interfaces-from-csv.mjs [--csv "D:/path/audio_interfaces.csv"] [--apply]
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const defaultCsvPath = path.join("D:", "ダウンロード", "audio_interfaces.csv")
const target = path.join(root, "lib/audio-interface-bestsellers.ts")
const reportPath = path.join(root, "scripts/audio-interface-csv-sync-report.json")

const csvArgIndex = process.argv.indexOf("--csv")
const csvPath =
  csvArgIndex >= 0 ? process.argv[csvArgIndex + 1] : defaultCsvPath
const apply = process.argv.includes("--apply")
const DASH = "—"

function parseCsv(text) {
  const rows = []
  let row = []
  let current = ""
  let inQuotes = false

  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          current += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        current += ch
      }
    } else if (ch === '"') {
      inQuotes = true
    } else if (ch === ",") {
      row.push(current)
      current = ""
    } else if (ch === "\n") {
      row.push(current)
      rows.push(row)
      row = []
      current = ""
    } else if (ch !== "\r") {
      current += ch
    }
  }

  if (current.length > 0 || row.length > 0) {
    row.push(current)
    rows.push(row)
  }

  return rows
}

function normalizeCsvValue(value) {
  const text = String(value ?? "").trim()
  if (!text || text === "-" || text === DASH) return ""
  return text
}

function escapeTs(value) {
  return String(value)
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\r\n/g, "\\n")
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\n")
    .replace(/\t/g, "\\t")
}

function parseGadgetBlocks(text) {
  const gadgets = []
  let depth = 0
  let start = -1

  for (let i = 0; i < text.length; i++) {
    if (text.startsWith("{", i) && /[\s,\[]/.test(text[i - 1] ?? "[")) {
      if (depth === 0) start = i
      depth++
    } else if (text[i] === "}") {
      depth--
      if (depth === 0 && start >= 0) {
        gadgets.push({ start, end: i + 1, text: text.slice(start, i + 1) })
        start = -1
      }
    }
  }
  return gadgets
}

function replaceStringField(block, field, value) {
  const re = new RegExp(`(${field}: ")(?:[^"\\\\]|\\\\.|\\n)*(")`)
  if (re.test(block)) {
    return block.replace(re, `$1${escapeTs(value)}$2`)
  }
  return block
}

function replacePriceField(block, price) {
  if (price === null || price === "") {
    if (/price: null/.test(block)) return block
    return block.replace(/price: \d+/, "price: null")
  }
  const numeric = Number(String(price).replace(/,/g, ""))
  if (!Number.isFinite(numeric)) return block
  if (/price: null/.test(block)) {
    return block.replace(/price: null/, `price: ${numeric}`)
  }
  return block.replace(/price: \d+/, `price: ${numeric}`)
}

function replaceHighlight(block, label, value) {
  const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  const re = new RegExp(`\\{ label: "${escapedLabel}", value: "[^"]*" \\}`)
  if (re.test(block)) {
    return block.replace(re, `{ label: "${label}", value: "${escapeTs(value)}" }`)
  }
  return block
}

function replaceSpecRow(block, label, value) {
  const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  const re = new RegExp(`          \\{ label: "${escapedLabel}", value: "[^"]*" \\},`)
  if (re.test(block)) {
    return block.replace(
      re,
      `          { label: "${label}", value: "${escapeTs(value)}" },`,
    )
  }
  return block
}

function upsertStringField(block, field, value, afterField = "samplingRate") {
  if (new RegExp(`${field}: "`).test(block)) {
    return replaceStringField(block, field, value)
  }
  const afterRe = new RegExp(`(${afterField}: "(?:[^"\\\\]|\\\\.|\\n)*",)`)
  if (afterRe.test(block)) {
    return block.replace(afterRe, `$1\n    ${field}: "${escapeTs(value)}",`)
  }
  return block
}

function removeStringField(block, field) {
  return block.replace(
    new RegExp(`\\n    ${field}: "(?:[^"\\\\]|\\\\.|\\n)*",`),
    "",
  )
}

function loadCsvRecords(filePath) {
  const raw = fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, "")
  const rows = parseCsv(raw)
  const header = rows[0] ?? []
  const records = new Map()

  for (const row of rows.slice(1)) {
    const id = normalizeCsvValue(row[0])
    if (!id) continue
    records.set(id, {
      id,
      name: normalizeCsvValue(row[1]),
      description: normalizeCsvValue(row[2]),
      price: normalizeCsvValue(row[3]),
      inputs: normalizeCsvValue(row[4]),
      pcConnection: normalizeCsvValue(row[5]),
      phantomPower: normalizeCsvValue(row[6]),
      systemRequirements: normalizeCsvValue(row[7]),
      samplingRate: normalizeCsvValue(row[8]),
      inputTier: normalizeCsvValue(row[9]),
      spreadsheetKNote: normalizeCsvValue(row[10]),
    })
  }

  return { header, records }
}

const { header, records: csvById } = loadCsvRecords(csvPath)
const source = fs.readFileSync(target, "utf8")
const blocks = parseGadgetBlocks(source)
const existingIds = blocks
  .map(({ text }) => text.match(/id: "([^"]+)"/)?.[1] ?? "")
  .filter(Boolean)

const report = {
  csvPath,
  csvHeader: header,
  csvRowCount: csvById.size,
  existingGadgetCount: existingIds.length,
  updated: [],
  skippedMissingInCsv: [],
  skippedMissingInLib: [],
  csvOnlyNotInserted: [],
}

for (const id of existingIds) {
  if (!csvById.has(id)) report.skippedMissingInCsv.push(id)
}
for (const id of csvById.keys()) {
  if (!existingIds.includes(id)) report.csvOnlyNotInserted.push(id)
}

let next = source
let offset = 0

for (const { start, end, text: block } of blocks) {
  if (!/category: "audio-interface"/.test(block)) continue

  const id = block.match(/id: "([^"]+)"/)?.[1] ?? ""
  const csv = csvById.get(id)
  if (!csv) {
    report.skippedMissingInLib.push(id)
    continue
  }

  let updatedBlock = block
  updatedBlock = replaceStringField(updatedBlock, "name", csv.name)
  updatedBlock = replaceStringField(updatedBlock, "tagline", csv.description)
  updatedBlock = replacePriceField(updatedBlock, csv.price)
  updatedBlock = replaceStringField(updatedBlock, "inputs", csv.inputs || DASH)
  updatedBlock = replaceStringField(updatedBlock, "connectionType", csv.pcConnection || DASH)
  updatedBlock = replaceStringField(updatedBlock, "connection", csv.pcConnection || DASH)
  updatedBlock = replaceStringField(updatedBlock, "phantomPower", csv.phantomPower || DASH)
  updatedBlock = replaceStringField(updatedBlock, "systemRequirements", csv.systemRequirements || DASH)
  updatedBlock = replaceStringField(updatedBlock, "samplingRate", csv.samplingRate || DASH)

  if (csv.inputTier) {
    updatedBlock = upsertStringField(
      updatedBlock,
      "audioInterfaceInputTier",
      csv.inputTier,
      "samplingRate",
    )
  } else if (/audioInterfaceInputTier:/.test(updatedBlock)) {
    updatedBlock = removeStringField(updatedBlock, "audioInterfaceInputTier")
  }

  if (csv.spreadsheetKNote) {
    updatedBlock = upsertStringField(
      updatedBlock,
      "audioInterfaceSpreadsheetKNote",
      csv.spreadsheetKNote,
      "samplingRate",
    )
  } else if (/audioInterfaceSpreadsheetKNote:/.test(updatedBlock)) {
    updatedBlock = removeStringField(updatedBlock, "audioInterfaceSpreadsheetKNote")
  }

  const inputsDisplay = csv.inputs || DASH
  const phantomDisplay = csv.phantomPower || DASH
  const systemDisplay = csv.systemRequirements || DASH
  const samplingDisplay = csv.samplingRate || DASH

  updatedBlock = replaceHighlight(updatedBlock, "入力端子と数", inputsDisplay)
  updatedBlock = replaceHighlight(updatedBlock, "ファンタム電源", phantomDisplay)
  updatedBlock = replaceHighlight(updatedBlock, "システム要件", systemDisplay)
  updatedBlock = replaceHighlight(updatedBlock, "サンプリングレート", samplingDisplay)
  updatedBlock = replaceSpecRow(updatedBlock, "入力端子", inputsDisplay)
  updatedBlock = replaceSpecRow(updatedBlock, "PC接続", csv.pcConnection || DASH)
  updatedBlock = replaceSpecRow(updatedBlock, "ファンタム電源", phantomDisplay)
  updatedBlock = replaceSpecRow(updatedBlock, "システム要件", systemDisplay)
  updatedBlock = replaceSpecRow(updatedBlock, "サンプリングレート", samplingDisplay)

  if (updatedBlock !== block) {
    report.updated.push({ id, inputTier: csv.inputTier || null })
    next = next.slice(0, start + offset) + updatedBlock + next.slice(end + offset)
    offset += updatedBlock.length - block.length
  }
}

fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8")

console.log(`CSV rows: ${report.csvRowCount}`)
console.log(`Existing gadgets: ${report.existingGadgetCount}`)
console.log(`Updated matches: ${report.updated.length}`)
console.log(`CSV-only (not inserted): ${report.csvOnlyNotInserted.length}`)
console.log(`Lib-only (missing CSV): ${report.skippedMissingInCsv.length}`)
console.log(`Report: ${reportPath}`)

if (apply) {
  fs.writeFileSync(target, next, "utf8")
  console.log(`Applied updates to ${target}`)
} else {
  console.log("Dry run only. Re-run with --apply to write changes.")
}
