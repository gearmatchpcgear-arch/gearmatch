/**
 * Sync existing mic gadgets from microphones_extracted.xlsx / .csv (update only — no new cards).
 *
 * Columns:
 * id, name, 商品説明, 指向性, 接続方式, 周波数特性, マイクタイプ, サンプルレート, 価格, マイク感度, その他機能
 *
 * Usage:
 *   npx tsx scripts/sync-mic-from-spreadsheet.mjs
 *   npx tsx scripts/sync-mic-from-spreadsheet.mjs microphones_extracted.xlsx
 *   npx tsx scripts/sync-mic-from-spreadsheet.mjs D:/ダウンロード/microphones_extracted.xlsx
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import XLSX from "xlsx"
import {
  normalizeMicConnectionDisplay,
  normalizeMicDirectivityDisplay,
  normalizeMicTypeDisplay,
  normalizeMicFrequencyResponseDisplay,
  DASH,
} from "./spec-display-normalize.mjs"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, "..")
const LIB = path.join(ROOT, "lib")
const DEFAULT_SOURCE = path.join(ROOT, "microphones_extracted.xlsx")
const SOURCE_PATH = process.argv[2] ?? DEFAULT_SOURCE

/** Spreadsheet id → gadget id in lib (same product, id renamed in codebase) */
const SPREADSHEET_ID_TO_GADGET_ID = {
  "mic-cnd-003": "microphone-audio-technica-at2020",
}

/** Do not apply spreadsheet bulk sync (manual / curated entries) */
const SYNC_EXCLUDED_GADGET_IDS = new Set([
  "microphone-audio-technica-at2020",
  "microphone-rode-nt1-5th-gen",
  "mic-dyn-003",
  "mic-dyn-009",
])

/** Keep name/price when DB product diverges from spreadsheet row (e.g. MV7+ vs MV7) */
const SKIP_NAME_PRICE_GADGET_IDS = new Set(["mic-dyn-003", "mic-dyn-009"])

function resolveGadgetId(spreadsheetId) {
  return SPREADSHEET_ID_TO_GADGET_ID[spreadsheetId] ?? spreadsheetId
}

function collectExistingMicIds() {
  const ids = new Set()
  for (const file of fs.readdirSync(LIB)) {
    if (!file.endsWith(".ts")) continue
    const src = fs.readFileSync(path.join(LIB, file), "utf8")
    if (!src.includes('category: "mic"')) continue
    let searchFrom = 0
    while (searchFrom < src.length) {
      const idx = src.indexOf('category: "mic"', searchFrom)
      if (idx === -1) break
      const head = src.slice(Math.max(0, idx - 320), idx)
      const idMatch = head.match(/id: "((?:mic|microphone)-[^"]+)"/g)
      if (idMatch) {
        const last = idMatch[idMatch.length - 1].match(/id: "((?:mic|microphone)-[^"]+)"/)
        if (last) ids.add(last[1])
      }
      searchFrom = idx + 1
    }
  }
  return ids
}

const EXISTING_IDS = collectExistingMicIds()

function parseCsvLine(line) {
  const cols = []
  let cur = ""
  let inQ = false
  for (let i = 0; i < line.length; i++) {
    const c = line[i]
    if (inQ) {
      if (c === '"' && line[i + 1] === '"') {
        cur += '"'
        i++
      } else if (c === '"') inQ = false
      else cur += c
    } else if (c === ",") {
      cols.push(cur)
      cur = ""
    } else if (c === '"') inQ = true
    else cur += c
  }
  cols.push(cur)
  return cols
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

function normalizeSpreadsheetJTag(raw) {
  if (isMissing(raw)) return null
  const t = raw.trim().normalize("NFKC")
  if (/ノイズキャンセ/i.test(t)) return "ノイズキャンセリング"
  if (/asmr|ＡＳＭＲ/i.test(t)) return "ASMR"
  if (/rgb/i.test(t)) return "RGB"
  if (/ボイスチェンジャ/i.test(t)) return "ボイスチェンジャー"
  return null
}

function normalizeSpreadsheetKTag(raw) {
  if (isMissing(raw)) return null
  const t = raw.trim().normalize("NFKC")
  if (/ミュート/i.test(t)) return "ミュート機能"
  return null
}

function parseOtherFeatures(raw) {
  if (isMissing(raw)) return { jTags: [], kTags: [], extraFeatures: [] }
  const parts = String(raw)
    .split(/\s*[\/／,、・]\s*/)
    .map((p) => p.trim())
    .filter(Boolean)

  const jTags = []
  const kTags = []
  const extraFeatures = []

  for (const part of parts) {
    const j = normalizeSpreadsheetJTag(part)
    const k = normalizeSpreadsheetKTag(part)
    if (j) jTags.push(j)
    else if (k) kTags.push(k)
    else extraFeatures.push(part)
  }

  return {
    jTags: [...new Set(jTags)],
    kTags: [...new Set(kTags)],
    extraFeatures: [...new Set(extraFeatures)],
  }
}

function cleanseMicType(raw, connection, name) {
  if (isMissing(raw)) return null
  const isStandType = /卓上|スタンド|テーブル|デスクトップ|会議|USBコンデンサー|アレイ|スピーカーフォン/i.test(
    `${raw} ${connection} ${name}`,
  )
  return normalizeMicTypeDisplay(raw, { isStandType })
}

function rowFromExtractedColumns(cols) {
  const [
    id,
    name,
    tagline,
    directivity,
    connection,
    frequency,
    micType,
    sampleRate,
    price,
    sensitivity,
    otherFeatures,
  ] = cols

  const cleansedConnection = isMissing(connection)
    ? null
    : normalizeMicConnectionDisplay(connection)
  const cleansedDirectivity = isMissing(directivity)
    ? null
    : normalizeMicDirectivityDisplay(directivity)
  const cleansedType = cleanseMicType(micType, `${connection} ${name}`, name)
  const cleansedFrequency = isMissing(frequency)
    ? null
    : normalizeMicFrequencyResponseDisplay(String(frequency).trim())
  const cleansedSampleRate = isMissing(sampleRate) ? null : String(sampleRate).trim()
  const cleansedSensitivity = isMissing(sensitivity) ? null : String(sensitivity).trim()
  const cleansedTagline = isMissing(tagline) ? null : sanitizeTsString(tagline)
  const { jTags, kTags, extraFeatures } = parseOtherFeatures(otherFeatures)

  return {
    id: String(id).trim(),
    gadgetId: resolveGadgetId(String(id).trim()),
    name: String(name).trim(),
    tagline: cleansedTagline,
    directivity: cleansedDirectivity,
    connection: cleansedConnection === DASH ? null : cleansedConnection,
    frequency: cleansedFrequency,
    micType: cleansedType,
    sampleRate: cleansedSampleRate,
    price: parsePrice(price),
    sensitivity: cleansedSensitivity,
    jTags,
    kTags,
    extraFeatures,
  }
}

function rowFromLegacyColumns(cols) {
  const [id, name, directivity, connection, frequency, micType, sampleRate, price, sensitivity, featureJ, featureK] =
    cols
  const cleansedConnection = isMissing(connection)
    ? null
    : normalizeMicConnectionDisplay(connection)
  const cleansedDirectivity = isMissing(directivity)
    ? null
    : normalizeMicDirectivityDisplay(directivity)
  const cleansedType = cleanseMicType(micType, `${connection} ${name}`, name)

  return {
    id: String(id).trim(),
    gadgetId: resolveGadgetId(String(id).trim()),
    name: String(name).trim(),
    tagline: null,
    directivity: cleansedDirectivity,
    connection: cleansedConnection === DASH ? null : cleansedConnection,
    frequency: isMissing(frequency)
      ? null
      : normalizeMicFrequencyResponseDisplay(String(frequency).trim()),
    micType: cleansedType,
    sampleRate: isMissing(sampleRate) ? null : String(sampleRate).trim(),
    price: parsePrice(price),
    sensitivity: isMissing(sensitivity) ? null : String(sensitivity).trim(),
    jTags: [...new Set([normalizeSpreadsheetJTag(featureJ)].filter(Boolean))],
    kTags: [...new Set([normalizeSpreadsheetKTag(featureK)].filter(Boolean))],
    extraFeatures: [],
  }
}

function cleanseRow(cols, header) {
  if (header.includes("商品説明")) return rowFromExtractedColumns(cols)
  return rowFromLegacyColumns(cols)
}

function loadSpreadsheetRows() {
  const ext = path.extname(SOURCE_PATH).toLowerCase()
  let header = []
  let dataRows = []

  if (ext === ".xlsx" || ext === ".xls") {
    const wb = XLSX.readFile(SOURCE_PATH)
    const ws = wb.Sheets[wb.SheetNames[0]]
    const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" })
    header = rows[0]?.map((h) => String(h).trim()) ?? []
    dataRows = rows.slice(1)
  } else {
    const text = fs.readFileSync(SOURCE_PATH, "utf8").replace(/^\uFEFF/, "")
    const lines = text.trim().split(/\r?\n/)
    header = parseCsvLine(lines[0] ?? "").map((h) => h.trim())
    dataRows = lines.slice(1).map(parseCsvLine)
  }

  const rows = new Map()
  let skippedNew = 0

  for (const rawCols of dataRows) {
    const cols = rawCols.map((c) => (c == null ? "" : String(c)))
    const spreadsheetId = cols[0]?.trim()
    if (!spreadsheetId) continue
    const gadgetId = resolveGadgetId(spreadsheetId)
    if (!EXISTING_IDS.has(gadgetId)) {
      skippedNew++
      continue
    }
    const row = cleanseRow(cols, header)
    rows.set(gadgetId, row)
  }

  return { rows, skippedNew, header }
}

function sanitizeTsString(value) {
  return String(value)
    .replace(/\r\n/g, " ")
    .replace(/[\r\n]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
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

function replaceTaglineField(block, value) {
  const safe = sanitizeTsString(value)
  const multilineRe = /tagline: "[\s\S]*?",\n(?=    (?:price:|rating:|listPrice:|image:))/
  if (multilineRe.test(block)) {
    const next = block.replace(multilineRe, `tagline: "${safe.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}",\n`)
    return { block: next, changed: next !== block }
  }
  return replaceQuotedField(block, "tagline", safe)
}

function replaceQuotedField(block, field, value) {
  const safe = sanitizeTsString(value)
  const re = new RegExp(`(${field}: ")([^"]*)(")`)
  if (!re.test(block)) return { block, changed: false }
  const next = block.replace(re, `$1${safe.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}$3`)
  return { block: next, changed: next !== block }
}

function replaceHighlightField(block, label, value) {
  const display = value ?? DASH
  const re = new RegExp(`(\\{ label: "${escapeRegExp(label)}", value: ")([^"]*)(" \\})`)
  if (!re.test(block)) return { block, changed: false }
  re.lastIndex = 0
  const next = block.replace(re, `$1${display.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}$3`)
  return { block: next, changed: next !== block }
}

function replaceSpecField(block, label, value) {
  const display = value ?? DASH
  const re = new RegExp(`(\\{ label: "${escapeRegExp(label)}", value: ")([^"]*)(" \\})`)
  const specStart = block.indexOf("specGroups:")
  if (specStart === -1) return { block, changed: false }
  const head = block.slice(0, specStart)
  const tail = block.slice(specStart)
  if (!tail.includes(`label: "${label}"`)) return { block, changed: false }
  if (!re.test(tail)) return { block, changed: false }
  re.lastIndex = 0
  const newTail = tail.replace(re, `$1${display.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}$3`)
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

  const insertAfter = ["micSpreadsheetKTags:", "micSpreadsheetJTags:", "micFeatureTags:", "micUseTags:", "micFilterTags:"]
  for (const anchor of insertAfter) {
    if (block.includes(anchor)) {
      const next = block.replace(
        new RegExp(`(    ${anchor.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")} \\[[^\\]]*\\],?\\n)`),
        `$1${formatted}\n`,
      )
      return { block: next, changed: true }
    }
  }

  if (block.includes("connection:")) {
    const next = block.replace(/(    connection: "[^"]*",\n)/, `$1${formatted}\n`)
    return { block: next, changed: true }
  }

  return { block, changed: false }
}

function mergeMicFeatureTags(existingRaw, jTags, kTags, extraFeatures) {
  const tags = new Set([...existingRaw.matchAll(/"([^"]+)"/g)].map((m) => m[1]))
  if (jTags.includes("ノイズキャンセリング")) tags.add("ノイズキャンセリング機能")
  if (kTags.includes("ミュート機能")) tags.add("ミュートボタン（タッチミュート）")
  if (jTags.includes("RGB") || extraFeatures.some((f) => /rgb/i.test(f))) {
    tags.add("RGBライティング")
  }
  if (jTags.includes("ボイスチェンジャー") || extraFeatures.some((f) => /ボイスチェンジャ/i.test(f))) {
    tags.add("ボイスチェンジャー")
  }

  const order = [
    "ミュートボタン（タッチミュート）",
    "イヤホンジャック（ダイレクトモニタリング）",
    "ゲインノブ（音量調節ノブ）",
    "ノイズキャンセリング機能",
    "RGBライティング",
    "ボイスチェンジャー",
  ]
  return order.filter((t) => tags.has(t))
}

function updateBlock(block, row) {
  let next = block
  let changed = false
  const gadgetId = row.gadgetId ?? row.id

  const apply = (result) => {
    next = result.block
    if (result.changed) changed = true
  }

  if (!SKIP_NAME_PRICE_GADGET_IDS.has(gadgetId)) {
    apply(replaceQuotedField(next, "name", row.name))

    if (row.tagline) {
      apply(replaceTaglineField(next, row.tagline))
    }

    if (row.price != null) {
      apply(replaceScalarField(next, "price", () => String(row.price)))
    }
  } else if (row.tagline) {
    apply(replaceTaglineField(next, row.tagline))
  }

  if (row.connection) {
    apply(replaceQuotedField(next, "connection", row.connection))
  }

  const specFields = [
    ["指向性", row.directivity],
    ["接続方式", row.connection],
    ["周波数特性", row.frequency],
    ["サンプルレート", row.sampleRate],
    ["マイク感度", row.sensitivity],
    ["タイプ", row.micType],
  ]

  for (const [label, value] of specFields) {
    if (value == null || value === "") continue
    apply(replaceHighlightField(next, label, value))
    apply(replaceSpecField(next, label, value))
  }

  apply(replaceArrayField(next, "micSpreadsheetJTags", row.jTags))
  apply(replaceArrayField(next, "micSpreadsheetKTags", row.kTags))

  if (row.sensitivity) {
    apply(replaceQuotedField(next, "micSensitivity", row.sensitivity))
  }

  const existingFeature = next.match(/micFeatureTags: \[([^\]]*)\]/)?.[1] ?? ""
  const mergedFeatures = mergeMicFeatureTags(existingFeature, row.jTags, row.kTags, row.extraFeatures)
  apply(replaceArrayField(next, "micFeatureTags", mergedFeatures))

  return { block: next, changed }
}

function findMicBlockBounds(src, id) {
  const escaped = escapeRegExp(id)
  const openRe = new RegExp(`\\n[ ]{2,8}\\{\\n    id: "${escaped}"`)
  let searchFrom = 0

  while (searchFrom < src.length) {
    openRe.lastIndex = searchFrom
    const openMatch = openRe.exec(src)
    if (!openMatch) return null

    const blockStart = openMatch.index + 1
    const tail = src.slice(blockStart)
    const endMatch = tail.match(/\n  \}(?:,|\n)/)
    if (!endMatch || endMatch.index == null) return null

    const blockEnd = blockStart + endMatch.index + endMatch[0].length
    const block = src.slice(blockStart, blockEnd)
    if (!block.includes('category: "mic"')) {
      searchFrom = openMatch.index + 1
      continue
    }

    return {
      start: blockStart,
      end: blockEnd,
      block,
    }
  }

  return null
}

function applyToFile(filePath, rows) {
  let src = fs.readFileSync(filePath, "utf8")
  if (!src.includes('category: "mic"')) return 0

  let updated = 0
  for (const [gadgetId, row] of rows) {
    if (SYNC_EXCLUDED_GADGET_IDS.has(gadgetId)) continue

    const bounds = findMicBlockBounds(src, gadgetId)
    if (!bounds) continue
    const { block: next, changed } = updateBlock(bounds.block, row)
    if (!changed) continue
    src = src.slice(0, bounds.start) + next + src.slice(bounds.end)
    updated++
  }

  if (updated > 0) fs.writeFileSync(filePath, src)
  return updated
}

function normalizeFrequencyFieldsInSource(src) {
  if (!src.includes('category: "mic"') || !src.includes("周波数特性")) return { src, changed: false }
  let changed = false
  const next = src.replace(
    /(\{ label: "周波数特性", value: ")([^"]*)(" \})/g,
    (match, pre, val, post) => {
      if (isMissing(val) || val === DASH) return match
      const normalized = normalizeMicFrequencyResponseDisplay(val)
      if (!normalized || normalized === val) return match
      changed = true
      return `${pre}${normalized.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}${post}`
    },
  )
  return { src: next, changed }
}

function normalizeFrequencyFieldsInLib() {
  let files = 0
  for (const file of fs.readdirSync(LIB)) {
    if (!file.endsWith(".ts")) continue
    const filePath = path.join(LIB, file)
    let src = fs.readFileSync(filePath, "utf8")
    const { src: next, changed } = normalizeFrequencyFieldsInSource(src)
    if (!changed) continue
    fs.writeFileSync(filePath, next)
    files++
    console.log(`${file}: frequency fields normalized`)
  }
  return files
}

const { rows, skippedNew, header } = loadSpreadsheetRows()
console.log(`Source: ${SOURCE_PATH}`)
console.log(`Header: ${header.join(", ")}`)
console.log(`Rows to sync (existing IDs only): ${rows.size}`)
console.log(`Skipped (not in codebase): ${skippedNew}`)

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

const freqFiles = normalizeFrequencyFieldsInLib()
if (freqFiles > 0) {
  console.log(`Frequency normalization pass: ${freqFiles} file(s)`)
}
