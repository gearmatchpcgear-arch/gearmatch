/**
 * Sync existing monitor gadgets from external monitors.xlsx (update only — no new cards).
 * Usage: npx tsx scripts/sync-monitor-from-spreadsheet.mjs [xlsxPath]
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { createRequire } from "node:module"
import { DASH, normalizeMonitorRefreshDisplay } from "./spec-display-normalize.mjs"

const require = createRequire(import.meta.url)
const XLSX = require("xlsx")

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, "..")
const DEFAULT_XLSX = "D:/ダウンロード/monitors.xlsx"
const XLSX_PATH = process.argv[2] ?? DEFAULT_XLSX

const EXISTING_IDS = loadExistingMonitorIdsFromFiles()

function loadExistingMonitorIdsFromFiles() {
  const ids = new Set()
  for (const file of fs.readdirSync(path.join(ROOT, "lib"))) {
    if (!file.endsWith(".ts")) continue
    const src = fs.readFileSync(path.join(ROOT, "lib", file), "utf8")
    if (!src.includes('category: "monitor"')) continue
    const blockRe = /id: "(mon-[^"]+)"[\s\S]*?category: "monitor"/g
    for (const match of src.matchAll(blockRe)) {
      ids.add(match[1])
    }
  }
  return ids
}

function isMissing(value) {
  if (value == null) return true
  const t = String(value).trim()
  return !t || t === "-" || t === "—"
}

function parsePrice(raw) {
  if (isMissing(raw)) return null
  const n = Number(String(raw).replace(/[,，]/g, ""))
  return Number.isFinite(n) ? n : null
}

function normalizeSpreadsheetLTag(raw) {
  if (isMissing(raw)) return null
  const t = raw.trim().normalize("NFKC")
  if (/曲面|curved/i.test(t)) return "曲面"
  return null
}

function formatScreenSizeHighlight(raw) {
  if (isMissing(raw)) return null
  const t = String(raw).trim()
  if (/"/.test(t)) return t
  const inchMatch = t.match(/^([\d.]+)\s*(?:インチ|型|inch)?/i)
  if (inchMatch) return `${inchMatch[1]}"`
  return t
}

function formatScreenSizeSpec(raw) {
  const highlight = formatScreenSizeHighlight(raw)
  if (!highlight) return null
  const inchMatch = highlight.match(/^([\d.]+)/)
  return inchMatch ? `${inchMatch[1]} インチ` : highlight
}

function parsePorts(raw) {
  if (isMissing(raw)) return { connection: null, rows: [] }

  const parts = raw
    .split(/\s*\/\s*/)
    .map((s) => s.trim())
    .filter(Boolean)

  const rows = []
  const connParts = []

  for (const part of parts) {
    const m = part.match(/^([^:：]+)[:：]\s*(.+)$/)
    if (m) {
      const label = m[1].trim()
      const value = m[2].trim()
      rows.push({ label, value })
      if (/対応|あり|○|yes/i.test(value) && !/非対応|不可|なし|×/i.test(value)) {
        connParts.push(label.replace(/\s*\([^)]*\)$/, "").trim())
      }
      continue
    }
    rows.push({ label: part, value: "対応" })
    connParts.push(part)
  }

  const connection = connParts.length > 0 ? connParts.join(" / ") : raw.trim()
  return { connection, rows }
}

function cleanseRow(cols) {
  const [
    id,
    name,
    description,
    price,
    screenSize,
    resolution,
    refreshRate,
    panelType,
    vesa,
    weight,
    ports,
    featureL,
  ] = cols

  const { connection, rows: portRows } = parsePorts(ports)
  const lTags = [...new Set([normalizeSpreadsheetLTag(featureL)].filter(Boolean))]

  return {
    id: String(id).trim(),
    name: String(name ?? "").trim(),
    description: isMissing(description) ? null : String(description).trim(),
    price: parsePrice(price),
    screenSizeHighlight: formatScreenSizeHighlight(screenSize),
    screenSizeSpec: formatScreenSizeSpec(screenSize),
    resolution: isMissing(resolution) ? null : String(resolution).trim(),
    refreshRate: isMissing(refreshRate)
      ? null
      : normalizeMonitorRefreshDisplay(String(refreshRate).trim()),
    panelType: isMissing(panelType) ? null : String(panelType).trim(),
    vesa: isMissing(vesa) ? null : String(vesa).trim(),
    weight: isMissing(weight) ? null : String(weight).trim(),
    connection: connection === DASH ? null : connection,
    portRows,
    lTags,
  }
}

function loadXlsxRows() {
  const wb = XLSX.readFile(XLSX_PATH)
  const sheet = wb.Sheets[wb.SheetNames[0]]
  const rawRows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" })
  const rows = new Map()
  let skippedNew = 0

  for (const cols of rawRows.slice(1)) {
    const id = String(cols[0] ?? "").trim()
    if (!id) continue
    if (!EXISTING_IDS.has(id)) {
      skippedNew++
      continue
    }
    rows.set(id, cleanseRow(cols))
  }

  return { rows, skippedNew }
}

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

function escapeTsString(value) {
  return String(value)
    .replace(/\r\n/g, " ")
    .replace(/\n/g, " ")
    .replace(/\r/g, " ")
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
}

function readQuotedStringEnd(block, startIdx) {
  let i = startIdx
  while (i < block.length) {
    if (block[i] === "\\") {
      i += 2
      continue
    }
    if (block[i] === '"') return i
    i++
  }
  return -1
}

function getFieldAnchors(field) {
  if (field === "name") return ["brand:"]
  if (field === "tagline") return ["price:"]
  if (field === "connection") {
    return ["purchaseUrl:", "vesaStandard:", "monitorFilterTags:", "highlights:"]
  }
  if (field === "vesaStandard") {
    return ["monitorFilterTags:", "monitorSpreadsheetLTags:", "highlights:"]
  }
  return []
}

function replaceFieldBeforeAnchor(block, field, value, anchors) {
  const escaped = escapeTsString(value)
  for (const anchor of anchors) {
    const re = new RegExp(`(${field}: ")[\\s\\S]*?(\\n    ${escapeRegExp(anchor)})`)
    if (!re.test(block)) continue
    const next = block.replace(re, `$1${escaped}",$2`)
    return { block: next, changed: true }
  }
  return { block, changed: false }
}

function replaceQuotedField(block, field, value) {
  const marker = `${field}: "`
  const start = block.indexOf(marker)
  if (start === -1) return { block, changed: false }

  const contentStart = start + marker.length
  const contentEnd = readQuotedStringEnd(block, contentStart)
  const escaped = escapeTsString(value)

  if (contentEnd !== -1) {
    const next = block.slice(0, contentStart) + escaped + block.slice(contentEnd)
    return { block: next, changed: next !== block }
  }

  return replaceFieldBeforeAnchor(block, field, value, getFieldAnchors(field))
}

function replaceNameField(block, value) {
  const anchorResult = replaceFieldBeforeAnchor(block, "name", value, getFieldAnchors("name"))
  if (anchorResult.changed) return anchorResult
  return replaceQuotedField(block, "name", value)
}

function replaceTaglineField(block, value) {
  const anchorResult = replaceFieldBeforeAnchor(block, "tagline", value, getFieldAnchors("tagline"))
  if (anchorResult.changed) return anchorResult
  return replaceQuotedField(block, "tagline", value)
}

function replaceScalarField(block, field, formatter) {
  const re = new RegExp(`(${field}: )([^,\\n]+)`, "m")
  const m = block.match(re)
  if (!m) return { block, changed: false }
  const nextVal = formatter(m[2])
  if (nextVal === m[2]) return { block, changed: false }
  return { block: block.replace(re, `$1${nextVal}`), changed: true }
}

function replaceHighlightField(block, label, value) {
  const display = escapeTsString(value ?? DASH)
  const re = new RegExp(`(\\{ label: "${escapeRegExp(label)}", value: ")([^"]*)(" \\})`, "g")
  if (!re.test(block)) return { block, changed: false }
  const next = block.replace(re, `$1${display}$3`)
  return { block: next, changed: next !== block }
}

function replaceSpecField(block, label, value) {
  const display = escapeTsString(value ?? DASH)
  const re = new RegExp(`(\\{ label: "${escapeRegExp(label)}", value: ")([^"]*)(" \\})`, "g")
  const specStart = block.indexOf("specGroups:")
  if (specStart === -1) return { block, changed: false }
  const head = block.slice(0, specStart)
  const tail = block.slice(specStart)
  if (!tail.includes(`label: "${label}"`)) return { block, changed: false }
  const newTail = tail.replace(re, `$1${display}$3`)
  if (newTail === tail) return { block, changed: false }
  return { block: head + newTail, changed: true }
}

function formatStringArrayField(field, tags) {
  if (tags.length === 0) return `    ${field}: [],`
  return `    ${field}: [${tags.map((t) => `"${t}"`).join(", ")}],`
}

function replaceArrayField(block, field, tags) {
  const formatted = formatStringArrayField(field, tags)
  if (new RegExp(`${field}:`).test(block)) {
    const next = block.replace(new RegExp(`    ${field}: \\[[^\\]]*\\],?\\n?`), `${formatted}\n`)
    return { block: next, changed: next !== block }
  }

  const insertAfter = [
    "monitorSpreadsheetLTags:",
    "monitorFilterTags:",
    "vesaStandard:",
    "connection:",
  ]
  for (const anchor of insertAfter) {
    if (block.includes(anchor)) {
      const next = block.replace(
        new RegExp(`(    ${anchor.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")} [^\\n]*\\n)`),
        `$1${formatted}\n`,
      )
      return { block: next, changed: true }
    }
  }

  return { block, changed: false }
}

function updateBlock(block, row) {
  let next = block
  let changed = false

  const apply = (result) => {
    next = result.block
    if (result.changed) changed = true
  }

  if (row.name) {
    apply(replaceNameField(next, row.name))
  }

  if (row.description) {
    apply(replaceTaglineField(next, row.description))
  }

  if (row.price != null) {
    apply(replaceScalarField(next, "price", () => String(row.price)))
  }

  if (row.connection) {
    apply(replaceQuotedField(next, "connection", row.connection))
  }

  apply(replaceQuotedField(next, "vesaStandard", row.vesa ?? DASH))

  if (row.screenSizeHighlight) {
    apply(replaceHighlightField(next, "画面サイズ", row.screenSizeHighlight))
  }
  if (row.screenSizeSpec) {
    apply(replaceSpecField(next, "画面サイズ", row.screenSizeSpec))
  }

  if (row.resolution) {
    apply(replaceHighlightField(next, "解像度", row.resolution))
    apply(replaceSpecField(next, "解像度", row.resolution))
  }

  if (row.refreshRate) {
    apply(replaceHighlightField(next, "リフレッシュ", row.refreshRate))
    apply(replaceSpecField(next, "リフレッシュレート", row.refreshRate))
  }

  if (row.panelType) {
    apply(replaceHighlightField(next, "パネル", row.panelType))
    apply(replaceSpecField(next, "パネル", row.panelType))
  }

  if (row.weight) {
    apply(replaceSpecField(next, "重量", row.weight))
  }

  for (const { label, value } of row.portRows) {
    apply(replaceSpecField(next, label, value))
  }

  apply(replaceArrayField(next, "monitorSpreadsheetLTags", row.lTags))

  return { block: next, changed }
}

function applyToFile(filePath, rows) {
  let src = fs.readFileSync(filePath, "utf8")
  if (!src.includes('category: "monitor"')) return 0

  let updated = 0
  const blockRe = /\{[\s\S]*?id: "([^"]+)"[\s\S]*?category: "monitor"[\s\S]*?\n  \}(?:,|\n)/g

  src = src.replace(blockRe, (block, id) => {
    const row = rows.get(id)
    if (!row) return block
    const { block: next, changed } = updateBlock(block, row)
    if (changed) updated++
    return next
  })

  if (updated > 0) fs.writeFileSync(filePath, src)
  return updated
}

const { rows, skippedNew } = loadXlsxRows()
console.log(`XLSX: ${XLSX_PATH}`)
console.log(`Rows to sync (existing IDs only): ${rows.size}`)
console.log(`Skipped (not in codebase): ${skippedNew}`)
console.log(`L-tag rows: ${[...rows.values()].filter((r) => r.lTags.length > 0).length}`)

let total = 0
for (const file of fs.readdirSync(path.join(ROOT, "lib"))) {
  if (!file.endsWith(".ts")) continue
  const count = applyToFile(path.join(ROOT, "lib", file), rows)
  if (count > 0) {
    console.log(`${file}: ${count} blocks updated`)
    total += count
  }
}

console.log(`Total updated: ${total}`)
