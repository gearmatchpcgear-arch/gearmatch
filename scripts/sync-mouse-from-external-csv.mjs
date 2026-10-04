/**
 * Sync existing mouse gadgets from external mouse_gadgets.csv (update only — no new cards).
 * Usage:
 *   npx tsx scripts/sync-mouse-from-external-csv.mjs [csvPath]
 *   npx tsx scripts/sync-mouse-from-external-csv.mjs --with-images
 */
import fs from "node:fs"
import path from "node:path"
import { execSync } from "node:child_process"
import { fileURLToPath } from "node:url"
import { allSourceGadgets } from "../lib/gadgets.ts"
import {
  DASH,
  normalizeMouseButtonCountLabel,
  normalizeMouseButtonCountStored,
  normalizeMouseConnectionDisplay,
  normalizeMouseDpiHighlight,
  normalizeMouseDpiSpec,
  normalizeMousePowerDisplay,
  normalizeMouseReadingDisplay,
  normalizeMouseWeightDisplay,
} from "./spec-display-normalize.mjs"
import { resolveMouseButtonCountLabelFromSpreadsheet, parseMouseButtonCount } from "../lib/mouse-button-count.ts"
import { extractMouseSpreadsheetUsageTags } from "../lib/mouse-spreadsheet-tags.ts"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, "..")
const EXTERNAL_CSV_ALT = "D:/ダウンロード/mouse_gadgets - mouse_gadgets.csv"
const EXTERNAL_CSV = "D:/ダウンロード/mouse_gadgets.csv"
const PROJECT_CSV = path.join(ROOT, "mouse_gadgets.csv")
const DEFAULT_CSV = [EXTERNAL_CSV_ALT, EXTERNAL_CSV, PROJECT_CSV].find((p) => fs.existsSync(p)) ?? PROJECT_CSV
const CSV_PATH = process.argv.find((a) => !a.startsWith("-") && a.endsWith(".csv")) ?? DEFAULT_CSV
const WITH_IMAGES = process.argv.includes("--with-images")

const EXISTING_IDS = new Set(
  allSourceGadgets.filter((g) => g.category === "mouse").map((g) => g.id),
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
  return !t || t === "-" || t === "—"
}

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

function escapeTsString(value) {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')
}

function cleanseRow(cols) {
  const [
    id,
    brand,
    name,
    fullTitle,
    weight,
    power,
    reading,
    buttons,
    connection,
    dpi,
    kColumn,
  ] = cols

  const cleansedBrand = isMissing(brand) || brand.trim() === "—" ? null : brand.trim()
  const cleansedName = isMissing(name) ? null : name.trim()
  const cleansedTagline = isMissing(fullTitle) ? null : fullTitle.trim()
  const cleansedWeight = isMissing(weight)
    ? null
    : normalizeMouseWeightDisplay(weight.trim())
  const cleansedPower = isMissing(power) ? null : normalizeMousePowerDisplay(power.trim())
  const cleansedReading = isMissing(reading)
    ? null
    : normalizeMouseReadingDisplay(reading.trim())
  const buttonStored = isMissing(buttons) ? null : normalizeMouseButtonCountStored(buttons.trim())
  const hasColumnValue = !isMissing(buttons) && buttonStored !== null
  const parsed = parseMouseButtonCount(
    isMissing(buttons) ? null : buttons.trim(),
    cleansedName ?? "",
    cleansedTagline ?? "",
  )
  const cleansedConnection = isMissing(connection)
    ? null
    : normalizeMouseConnectionDisplay(connection.trim())
  const cleansedDpiHighlight = isMissing(dpi) ? null : normalizeMouseDpiHighlight(dpi.trim())
  const cleansedDpiSpec = isMissing(dpi) ? null : normalizeMouseDpiSpec(dpi.trim())
  const usageSpecs = extractMouseSpreadsheetUsageTags({
    kColumn: isMissing(kColumn) ? null : kColumn.trim(),
    name: cleansedName,
    fullTitle: cleansedTagline,
    reading: cleansedReading,
    buttons: isMissing(buttons) ? null : buttons.trim(),
  })

  return {
    id: id.trim(),
    brand: cleansedBrand,
    name: cleansedName,
    tagline: cleansedTagline,
    weight: cleansedWeight === DASH ? null : cleansedWeight,
    power: cleansedPower === DASH ? null : cleansedPower,
    reading: cleansedReading === DASH ? null : cleansedReading,
    buttonStored,
    buttonLabel: parsed.label,
    hasColumnValue,
    connection: cleansedConnection === DASH ? null : cleansedConnection,
    dpiHighlight: cleansedDpiHighlight,
    dpiSpec: cleansedDpiSpec,
    usageSpecs,
    isGaming: usageSpecs.includes("gaming"),
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

function replaceQuotedField(block, field, value) {
  const re = new RegExp(`(${field}: ")([^"]*)(")`)
  if (!re.test(block)) return { block, changed: false }
  const next = block.replace(re, `$1${escapeTsString(value)}$3`)
  return { block: next, changed: next !== block }
}

function replaceLabelValue(block, label, value, compact = false) {
  const display = value ?? DASH
  const escapedLabel = escapeRegExp(label)
  const escapedVal = escapeTsString(display)

  const expanded = new RegExp(`(\\{ label: "${escapedLabel}", value: ")([^"]*)(" \\})`, "g")
  if (expanded.test(block)) {
    const next = block.replace(expanded, `$1${escapedVal}$3`)
    return { block: next, changed: next !== block }
  }

  if (compact) {
    const compactRe = new RegExp(
      `(\\{"label":"${escapedLabel}","value":")(?:\\\\.|[^"\\\\])*(\"\\})`,
      "g",
    )
    if (compactRe.test(block)) {
      const next = block.replace(compactRe, `$1${escapedVal}$2`)
      return { block: next, changed: next !== block }
    }
  }

  return { block, changed: false }
}

function replaceHighlightField(block, label, value) {
  return replaceLabelValue(block, label, value, true)
}

function replaceSpecField(block, label, value) {
  const display = value ?? DASH
  const escapedLabel = escapeRegExp(label)
  const escapedVal = escapeTsString(display)
  const re = new RegExp(`(\\{ label: "${escapedLabel}", value: ")([^"]*)(" \\})`, "g")
  const compactRe = new RegExp(
    `(\\{"label":"${escapedLabel}","value":")(?:\\\\.|[^"\\\\])*(\"\\})`,
    "g",
  )

  const specStart = block.indexOf("specGroups:")
  if (specStart === -1) return { block, changed: false }
  const head = block.slice(0, specStart)
  const tail = block.slice(specStart)
  if (!tail.includes(`label: "${label}"`) && !tail.includes(`"label":"${label}"`)) {
    return { block, changed: false }
  }

  let newTail = tail.replace(re, `$1${escapedVal}$3`)
  newTail = newTail.replace(compactRe, `$1${escapedVal}$2`)
  if (newTail === tail) return { block, changed: false }
  return { block: head + newTail, changed: true }
}

function ensureQuotedField(block, field, value) {
  const escaped = escapeTsString(value)
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

function insertSensorInputSpecField(block, label, value) {
  if (block.includes(`"label":"${label}"`) || block.includes(`label: "${label}"`)) {
    return { block, changed: false }
  }
  const escapedVal = escapeTsString(value)

  const compactGroup = block.match(/(\{"title":"センサー \/ 入力","rows":\[[^\]]*)(\]\})/)
  if (compactGroup) {
    const next = block.replace(
      compactGroup[0],
      `${compactGroup[1]},{"label":"${label}","value":"${escapedVal}"}${compactGroup[2]}`,
    )
    return { block: next, changed: true }
  }

  const expandedGroup = block.match(
    /(title: "センサー \/ 入力", rows: \[[\s\S]*?)(\n\s*\]\},)/,
  )
  if (expandedGroup) {
    const next = block.replace(
      expandedGroup[0],
      `${expandedGroup[1]}\n          { label: "${label}", value: "${escapedVal}" },${expandedGroup[2]}`,
    )
    return { block: next, changed: true }
  }

  return { block, changed: false }
}

function insertSpecField(block, label, value) {
  if (block.includes(`"label":"${label}"`) || block.includes(`label: "${label}"`)) {
    return { block, changed: false }
  }
  const escapedVal = escapeTsString(value)

  const compactGroup = block.match(
    /(\{"title":"接続 \/ 電源","rows":\[[^\]]*)(\]\})/,
  )
  if (compactGroup) {
    const next = block.replace(
      compactGroup[0],
      `${compactGroup[1]},{"label":"${label}","value":"${escapedVal}"}${compactGroup[2]}`,
    )
    return { block: next, changed: true }
  }

  const expandedGroup = block.match(
    /(title: "接続 \/ 電源", rows: \[[\s\S]*?)(\n\s*\]\},)/,
  )
  if (expandedGroup) {
    const next = block.replace(
      expandedGroup[0],
      `${expandedGroup[1]}\n          { label: "${label}", value: "${escapedVal}" },${expandedGroup[2]}`,
    )
    return { block: next, changed: true }
  }

  return { block, changed: false }
}

function applyMouseButtonCountFields(block, buttonLabel, { setSpreadsheetField = true } = {}) {
  let next = block
  let changed = false

  const apply = (result) => {
    next = result.block
    if (result.changed) changed = true
  }

  if (setSpreadsheetField) {
    apply(ensureQuotedField(next, "mouseSpreadsheetButtonCount", buttonLabel))
  } else if (/\bmouseSpreadsheetButtonCount:/.test(next)) {
    apply(removeQuotedField(next, "mouseSpreadsheetButtonCount"))
  }

  const buttonSpecResult = replaceSpecField(next, "ボタン数", buttonLabel)
  apply(buttonSpecResult)
  if (!buttonSpecResult.changed) apply(insertSensorInputSpecField(next, "ボタン数", buttonLabel))

  return { block: next, changed }
}

function formatStringArrayField(field, tags) {
  if (tags.length === 0) return `    ${field}: [],`
  return `    ${field}: [${tags.map((t) => `"${escapeTsString(t)}"`).join(", ")}],`
}

function replaceArrayField(block, field, tags) {
  const formatted = formatStringArrayField(field, tags)
  if (new RegExp(`${field}:`).test(block)) {
    const next = block.replace(new RegExp(`    ${field}: \\[[^\\]]*\\],?\\n?`), `${formatted}\n`)
    return { block: next, changed: next !== block }
  }

  const insertAfter = [
    "mouseSpreadsheetUsageSpecs:",
    "mouseSpreadsheetButtonCount:",
    "mouseFilterTags:",
    "mouseUsage:",
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

function replaceMouseUsageField(block, usage) {
  const formatted = `    mouseUsage: "${usage}",`
  if (/\bmouseUsage:/.test(block)) {
    const next = block.replace(/\bmouseUsage: "(?:gaming|productivity)",/, formatted)
    return { block: next, changed: next !== block }
  }
  if (block.includes("mouseSpreadsheetUsageSpecs:")) {
    const next = block.replace(
      /(    mouseSpreadsheetUsageSpecs: \[[^\]]*\],?\n)/,
      `$1${formatted}\n`,
    )
    return { block: next, changed: true }
  }
  if (block.includes("connection:")) {
    const next = block.replace(/(    connection: "[^"]*",\n)/, `$1${formatted}\n`)
    return { block: next, changed: true }
  }
  return { block, changed: false }
}

function removeQuotedField(block, field) {
  const inline = new RegExp(`\\n    ${field}: "[^"]*",`)
  if (inline.test(block)) {
    return { block: block.replace(inline, "\n"), changed: true }
  }
  return { block, changed: false }
}

function normalizeExistingMouseBlock(block) {
  let next = block
  let changed = false

  const apply = (result) => {
    next = result.block
    if (result.changed) changed = true
  }

  const readField = (label) => {
    const expanded = next.match(new RegExp(`\\{ label: "${escapeRegExp(label)}", value: "([^"]*)" \\}`))
    if (expanded) return expanded[1]
    const compact = next.match(new RegExp(`\\{"label":"${escapeRegExp(label)}","value":"([^"]*)"\\}`))
    return compact?.[1] ?? null
  }

  const connectionMatch = next.match(/connection: "([^"]*)"/)
  if (connectionMatch?.[1]) {
    const normalized = normalizeMouseConnectionDisplay(connectionMatch[1])
    if (normalized !== DASH && normalized !== connectionMatch[1]) {
      apply(replaceQuotedField(next, "connection", normalized))
    }
  }

  const powerRaw = readField("電源")
  if (powerRaw) {
    const normalized = normalizeMousePowerDisplay(powerRaw)
    if (normalized !== DASH && normalized !== powerRaw) {
      apply(replaceHighlightField(next, "電源", normalized))
      apply(replaceSpecField(next, "電源", normalized))
    }
  }

  const weightRaw = readField("重量")
  if (weightRaw) {
    const normalized = normalizeMouseWeightDisplay(weightRaw)
    if (normalized !== DASH && normalized !== weightRaw) {
      apply(replaceHighlightField(next, "重量", normalized))
      apply(replaceSpecField(next, "重量", normalized))
    }
  }

  const readingRaw = readField("読み取り方式")
  if (readingRaw) {
    const normalized = normalizeMouseReadingDisplay(readingRaw)
    if (normalized !== DASH && normalized !== readingRaw) {
      apply(replaceHighlightField(next, "読み取り方式", normalized))
      apply(replaceSpecField(next, "読み取り方式", normalized))
    }
  }

  const connSpecRaw = readField("接続方式")
  if (connSpecRaw) {
    const normalized = normalizeMouseConnectionDisplay(connSpecRaw)
    if (normalized !== DASH && normalized !== connSpecRaw) {
      apply(replaceSpecField(next, "接続方式", normalized))
    }
  }

  const dpiRaw = readField("最大DPI") ?? readField("最大 DPI")
  if (dpiRaw) {
    const highlight = normalizeMouseDpiHighlight(dpiRaw)
    const spec = normalizeMouseDpiSpec(dpiRaw)
    if (highlight && highlight !== dpiRaw) apply(replaceHighlightField(next, "最大DPI", highlight))
    if (spec) apply(replaceSpecField(next, "最大 DPI", spec))
  }

  const nameMatch = next.match(/name: "([^"]*)"/)
  const taglineMatch = next.match(/tagline: "([^"]*)"/)
  const sheetMatch = next.match(/mouseSpreadsheetButtonCount: "([^"]*)"/)
  const fromSheet = sheetMatch ? normalizeMouseButtonCountLabel(sheetMatch[1]) : null
  const expanded = next.match(/\{ label: "ボタン数", value: "([^"]*)" \}/)
  const compact = next.match(/\{"label":"ボタン数","value":"([^"]*)"\}/)
  const fromSpec = normalizeMouseButtonCountLabel(expanded?.[1] ?? compact?.[1])
  const buttonLabel = fromSheet ?? fromSpec
  if (buttonLabel) {
    apply(
      applyMouseButtonCountFields(next, buttonLabel, {
        setSpreadsheetField: Boolean(fromSheet),
      }),
    )
  }

  return { block: next, changed }
}

function updateBlock(block, row) {
  let next = block
  let changed = false

  const apply = (result) => {
    next = result.block
    if (result.changed) changed = true
  }

  if (row.name) apply(replaceQuotedField(next, "name", row.name))
  if (row.tagline) apply(replaceQuotedField(next, "tagline", row.tagline))
  if (row.brand) apply(replaceQuotedField(next, "brand", row.brand))
  if (row.connection) {
    apply(replaceQuotedField(next, "connection", row.connection))
    apply(replaceSpecField(next, "接続方式", row.connection))
  }
  if (row.weight) {
    apply(replaceHighlightField(next, "重量", row.weight))
    apply(replaceSpecField(next, "重量", row.weight))
  }
  if (row.power) {
    apply(replaceHighlightField(next, "電源", row.power))
    const powerResult = replaceSpecField(next, "電源", row.power)
    apply(powerResult)
    if (!powerResult.changed) apply(insertSpecField(next, "電源", row.power))
  }
  if (row.reading) {
    apply(replaceHighlightField(next, "読み取り方式", row.reading))
    apply(replaceSpecField(next, "読み取り方式", row.reading))
  }
  if (row.buttonLabel) {
    apply(
      applyMouseButtonCountFields(next, row.buttonLabel, {
        setSpreadsheetField: row.hasColumnValue,
      }),
    )
  }
  if (row.dpiHighlight) {
    apply(replaceHighlightField(next, "最大DPI", row.dpiHighlight))
  }
  if (row.dpiSpec) {
    apply(replaceSpecField(next, "最大 DPI", row.dpiSpec))
  }
  apply(replaceArrayField(next, "mouseSpreadsheetUsageSpecs", row.usageSpecs))
  if (row.isGaming) {
    apply(replaceMouseUsageField(next, "gaming"))
  }

  const normalized = normalizeExistingMouseBlock(next)
  next = normalized.block
  if (normalized.changed) changed = true

  return { block: next, changed }
}

function applyToFile(filePath, rows) {
  let src = fs.readFileSync(filePath, "utf8")
  if (!src.includes('category: "mouse"')) return 0

  let updated = 0
  const blockRe = /\{[\s\S]*?id: "([^"]+)"[\s\S]*?category: "mouse"[\s\S]*?\n  \}(?:,|\n|\])/g

  src = src.replace(blockRe, (block, id) => {
    const row = rows.get(id)
    if (row) {
      const { block: next, changed } = updateBlock(block, row)
      if (changed) updated++
      return next
    }
    const { block: next, changed } = normalizeExistingMouseBlock(block)
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

if (WITH_IMAGES) {
  console.log("\nSyncing mouse images from live Amazon product pages (image URLs only)...")
  execSync("node scripts/sync-mouse-images-from-live.mjs", {
    cwd: ROOT,
    stdio: "inherit",
  })
}
