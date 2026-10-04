/**
 * Sync existing keyboard gadgets from keyboard_gadgets.csv (update only — no new cards).
 * Usage: npx tsx scripts/sync-keyboard-from-spreadsheet.mjs [csvPath]
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { allSourceGadgets } from "../lib/gadgets.ts"
import { DASH } from "./spec-display-normalize.mjs"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, "..")
const DEFAULT_CSV = path.join(ROOT, "keyboard_gadgets.csv")
const CSV_PATH = process.argv[2] ?? DEFAULT_CSV

const EXISTING_IDS = new Set(
  allSourceGadgets.filter((g) => g.category === "keyboard").map((g) => g.id),
)

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
  return !t || t === "-" || t === "—" || t === "未記載"
}

function displayOrDash(value) {
  return isMissing(value) ? DASH : String(value).trim()
}

function parsePrice(raw) {
  if (isMissing(raw)) return null
  const n = Number(String(raw).replace(/[¥,，]/g, ""))
  return Number.isFinite(n) ? n : null
}

function normalizePollingRate(raw) {
  if (isMissing(raw)) return null
  const t = raw.trim().normalize("NFKC").replace(/,/g, "")

  const kMatch = t.match(/(\d+(?:\.\d+)?)\s*[kK]\b/)
  if (kMatch) {
    const num = Number(kMatch[1]) * 1000
    if (Number.isFinite(num) && num > 0) return `${Math.round(num)}Hz`
  }

  const hzMatch = t.match(/(\d+(?:\.\d+)?)\s*(?:Hz|HZ|hz)\b/)
  if (hzMatch) {
    const num = Number(hzMatch[1])
    if (Number.isFinite(num) && num > 0) return `${Math.round(num)}Hz`
  }

  return null
}

function parseGaming(raw) {
  if (isMissing(raw)) return null
  if (/ゲーミング/i.test(raw.trim())) return true
  return null
}

function parseRapidTrigger(raw) {
  if (isMissing(raw)) return null
  if (/ラピッドトリガー/i.test(raw.trim())) return true
  return null
}

function parseFeatures(raw) {
  if (isMissing(raw)) return []
  return [
    ...new Set(
      raw
        .split(/[、,/／|]/)
        .map((part) => part.trim())
        .filter(Boolean),
    ),
  ]
}

function cleanseInternalStructure(raw) {
  if (isMissing(raw)) return DASH
  const trimmed = raw.trim()
  if (trimmed === "磁器スイッチ") return "磁気スイッチ"
  if (/^メカニカル[（(]磁気スイッチ/u.test(trimmed)) return "磁気スイッチ"
  if (/^静電容量無接点方式[（(]\s*\d+\s*g\s*[）)]?\s*$/iu.test(trimmed)) return "静電容量無接点方式"
  if (/^メカニカル\s*[（(]\s*GX\s*Red\b/i.test(trimmed)) return "メカニカル（赤軸）"
  if (/^メカニカル\s*[（(]\s*イエロー軸\s*[）)]/u.test(trimmed)) return "メカニカル（黄軸）"
  if (trimmed === "イエロー軸") return "メカニカル（黄軸）"
  return trimmed
}

function cleanseRow(cols) {
  const [
    id,
    brand,
    name,
    fullTitle,
    layout,
    internalStructure,
    keycaps,
    connection,
    power,
    price,
    gamingRaw,
    pollingRaw,
    rapidTriggerRaw,
    layoutArray,
    featuresRaw,
  ] = cols

  const gaming = parseGaming(gamingRaw)
  const pollingRate = normalizePollingRate(pollingRaw)
  const rapidTrigger = parseRapidTrigger(rapidTriggerRaw)
  const features = parseFeatures(featuresRaw)

  return {
    id: id.trim(),
    brand: isMissing(brand) ? null : brand.trim(),
    name: name.trim(),
    fullTitle: isMissing(fullTitle) ? null : fullTitle.trim(),
    layout: displayOrDash(layout),
    internalStructure: cleanseInternalStructure(internalStructure),
    keycaps: displayOrDash(keycaps),
    connection: isMissing(connection) ? null : connection.trim(),
    power: displayOrDash(power),
    price: parsePrice(price),
    gaming,
    pollingRate,
    rapidTrigger,
    layoutArray: displayOrDash(layoutArray),
    features,
  }
}

function loadCsvRows() {
  const text = fs.readFileSync(CSV_PATH, "utf8").replace(/^\uFEFF/, "")
  const rows = new Map()
  let skippedNew = 0

  for (const line of text.trim().split(/\r?\n/).slice(1)) {
    const cols = parseCsvLine(line)
    const id = cols[0]?.trim()
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

function replaceOptionalBooleanField(block, field, value) {
  if (value == null) {
    if (new RegExp(`    ${field}:`).test(block)) {
      const next = block.replace(new RegExp(`    ${field}: (?:true|false),\\n`), "")
      return { block: next, changed: next !== block }
    }
    return { block, changed: false }
  }
  const formatted = `    ${field}: ${value},`
  if (new RegExp(`    ${field}:`).test(block)) {
    const next = block.replace(new RegExp(`    ${field}: (?:true|false),`), formatted)
    return { block: next, changed: next !== block }
  }
  const insertAfter = [
    "keyboardSpreadsheetFeatures:",
    "keyboardLayoutArray:",
    "keyboardSpreadsheetRapidTrigger:",
    "keyboardPollingRate:",
    "keyboardSpreadsheetGaming:",
    "hasRapidTrigger:",
    "keyboardUsage:",
    "keyboardFilterTags:",
  ]
  for (const anchor of insertAfter) {
    if (block.includes(anchor)) {
      const next = block.replace(
        new RegExp(`(    ${escapeRegExp(anchor)} [^\\n]*\\n)`),
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

function replaceOptionalStringField(block, field, value) {
  if (value == null) {
    if (new RegExp(`    ${field}:`).test(block)) {
      const next = block.replace(new RegExp(`    ${field}: "[^"]*",\\n`), "")
      return { block: next, changed: next !== block }
    }
    return { block, changed: false }
  }
  const formatted = `    ${field}: "${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}",`
  if (new RegExp(`    ${field}:`).test(block)) {
    const next = block.replace(new RegExp(`    ${field}: "[^"]*",`), formatted)
    return { block: next, changed: next !== block }
  }
  const insertAfter = [
    "keyboardSpreadsheetFeatures:",
    "keyboardLayoutArray:",
    "keyboardSpreadsheetRapidTrigger:",
    "keyboardPollingRate:",
    "keyboardSpreadsheetGaming:",
    "hasRapidTrigger:",
    "keyboardUsage:",
    "keyboardFilterTags:",
  ]
  for (const anchor of insertAfter) {
    if (block.includes(anchor)) {
      const next = block.replace(
        new RegExp(`(    ${escapeRegExp(anchor)} [^\\n]*\\n)`),
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

function formatStringArrayField(field, tags) {
  if (tags.length === 0) return `    ${field}: [],`
  return `    ${field}: [${tags.map((t) => `"${t.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`).join(", ")}],`
}

function replaceArrayField(block, field, tags) {
  const formatted = formatStringArrayField(field, tags)
  if (new RegExp(`${field}:`).test(block)) {
    const next = block.replace(new RegExp(`    ${field}: \\[[^\\]]*\\],?\\n?`), `${formatted}\n`)
    return { block: next, changed: next !== block }
  }

  const insertAfter = [
    "keyboardSpreadsheetFeatures:",
    "keyboardLayoutArray:",
    "keyboardSpreadsheetRapidTrigger:",
    "keyboardPollingRate:",
    "keyboardSpreadsheetGaming:",
    "keyboardFilterTags:",
    "keyboardUseTags:",
    "hasRapidTrigger:",
  ]
  for (const anchor of insertAfter) {
    if (block.includes(anchor)) {
      const next = block.replace(
        new RegExp(`(    ${escapeRegExp(anchor)} [^\\n]*\\n)`),
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

function renameSpecLabel(block, fromLabel, toLabel) {
  const re = new RegExp(`label: "${escapeRegExp(fromLabel)}"`, "g")
  if (!re.test(block)) return { block, changed: false }
  const next = block.replace(re, `label: "${toLabel}"`)
  return { block: next, changed: next !== block }
}

function migratePowerHighlightToLayoutArray(block, layoutArrayValue) {
  let next = block
  let changed = false

  if (next.includes('{ label: "電源", value:')) {
    const migrated = next.replace(
      /\{ label: "電源", value: "[^"]*" \}/,
      `{ label: "配列", value: "${layoutArrayValue.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}" }`,
    )
    if (migrated !== next) {
      next = migrated
      changed = true
    }
  }

  return { block: next, changed }
}

function ensureSpreadsheetSpecGroup(block, row) {
  const groupTitle = "仕様 / 機能"
  const rows = []

  if (row.gaming === true) {
    rows.push(`          { label: "ゲーミングキーボード", value: "ゲーミングキーボード" }`)
  }
  if (row.pollingRate) {
    rows.push(`          { label: "ポーリングレート", value: "${row.pollingRate}" }`)
  }
  if (row.rapidTrigger === true) {
    rows.push(`          { label: "ラピッドトリガー", value: "ラピッドトリガー" }`)
  }
  if (row.layoutArray && row.layoutArray !== DASH) {
    rows.push(`          { label: "配列", value: "${row.layoutArray.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}" }`)
  }
  if (row.features.length > 0) {
    rows.push(
      `          { label: "特徴", value: "${row.features.join(" / ").replace(/\\/g, "\\\\").replace(/"/g, '\\"')}" }`,
    )
  }

  if (rows.length === 0) return { block, changed: false }

  const groupBlock = `{ title: "${groupTitle}", rows: [\n${rows.join(",\n")},\n        ]}`

  if (block.includes(`title: "${groupTitle}"`)) {
    const re = new RegExp(
      `\\{ title: "${escapeRegExp(groupTitle)}", rows: \\[[\\s\\S]*?\\] \\}`,
      "m",
    )
    const next = block.replace(re, groupBlock)
    return { block: next, changed: next !== block }
  }

  const insertBefore = block.indexOf("specGroups:")
  if (insertBefore === -1) return { block, changed: false }
  const specGroupsStart = block.indexOf("[", insertBefore)
  const next = `${block.slice(0, specGroupsStart + 1)}\n      ${groupBlock},${block.slice(specGroupsStart + 1)}`
  return { block: next, changed: true }
}

function updateBlock(block, row) {
  let next = block
  let changed = false

  const apply = (result) => {
    next = result.block
    if (result.changed) changed = true
  }

  apply(renameSpecLabel(next, "接続方式", "接続方法"))
  apply(migratePowerHighlightToLayoutArray(next, row.layoutArray))

  apply(replaceQuotedField(next, "name", row.name))
  if (row.fullTitle) {
    apply(replaceQuotedField(next, "tagline", row.fullTitle))
  }
  if (row.brand) {
    apply(replaceQuotedField(next, "brand", row.brand === "未記載" ? "—" : row.brand))
  }
  if (row.price != null) {
    apply(replaceScalarField(next, "price", () => String(row.price)))
  }
  if (row.connection) {
    apply(replaceQuotedField(next, "connection", row.connection))
  }

  const cardHighlights = [
    ["レイアウト", row.layout],
    ["内部構造", row.internalStructure],
    ["キーキャップ", row.keycaps],
    ["配列", row.layoutArray],
  ]
  for (const [label, value] of cardHighlights) {
    apply(replaceHighlightField(next, label, value))
  }

  const keySwitchFields = [
    ["レイアウト", row.layout],
    ["内部構造", row.internalStructure],
    ["キーキャップ", row.keycaps],
  ]
  for (const [label, value] of keySwitchFields) {
    apply(replaceSpecField(next, label, value))
  }

  apply(replaceSpecField(next, "接続方法", row.connection))
  apply(replaceSpecField(next, "接続方式", row.connection))
  apply(replaceSpecField(next, "電源", row.power))

  if (row.gaming != null) {
    apply(replaceOptionalBooleanField(next, "keyboardSpreadsheetGaming", row.gaming))
    if (row.gaming) {
      apply(replaceQuotedField(next, "keyboardUsage", "gaming"))
    }
  }
  apply(replaceOptionalStringField(next, "keyboardPollingRate", row.pollingRate))
  if (row.rapidTrigger != null) {
    apply(replaceOptionalBooleanField(next, "keyboardSpreadsheetRapidTrigger", row.rapidTrigger))
    apply(replaceOptionalBooleanField(next, "hasRapidTrigger", row.rapidTrigger))
  }
  apply(replaceOptionalStringField(next, "keyboardLayoutArray", row.layoutArray === DASH ? null : row.layoutArray))
  apply(replaceArrayField(next, "keyboardSpreadsheetFeatures", row.features))

  apply(ensureSpreadsheetSpecGroup(next, row))

  return { block: next, changed }
}

function applyToFile(filePath, rows) {
  let src = fs.readFileSync(filePath, "utf8")
  if (!src.includes('category: "keyboard"')) return 0

  let updated = 0
  const blockRe = /\{[\s\S]*?id: "([^"]+)"[\s\S]*?category: "keyboard"[\s\S]*?\n  \}(?:,|\n)/g

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

const { rows, skippedNew } = loadCsvRows()
console.log(`CSV: ${CSV_PATH}`)
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
