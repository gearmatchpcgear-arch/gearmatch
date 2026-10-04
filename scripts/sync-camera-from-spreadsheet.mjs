/**
 * Sync existing camera gadgets from camera_list.csv (update only — no new cards).
 * Usage: npx tsx scripts/sync-camera-from-spreadsheet.mjs [csvPath]
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { allSourceGadgets } from "../lib/gadgets.ts"
import { normalizeCameraSpreadsheetITag } from "../lib/camera-spreadsheet-tags.ts"
import { DASH } from "./spec-display-normalize.mjs"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, "..")
const DEFAULT_CSV = "D:/ダウンロード/camera_list.csv"
const CSV_PATH = process.argv[2] ?? DEFAULT_CSV

const CAMERA_IDS = new Set(
  allSourceGadgets.filter((g) => g.category === "camera").map((g) => g.id),
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

function formatMicHighlight(raw) {
  if (isMissing(raw)) return DASH
  const t = raw.trim()
  if (/なし|無し|無\b|none/i.test(t)) return "—"
  if (/あり|有/i.test(t)) return "内蔵マイク"
  return t
}

function formatResolutionHighlight(resolution, frameRate) {
  if (isMissing(resolution)) return DASH
  if (isMissing(frameRate)) return resolution.trim()

  const res = resolution.trim()
  const fps = frameRate.trim()

  if (/60\s*fps\s*\(\s*1080p\s*\)/i.test(fps) && /4k/i.test(res)) {
    return "4K / 30fps"
  }
  if (/\bfps\b/i.test(fps) && !/\//.test(res)) {
    return `${res} / ${fps.replace(/\s*\([^)]*\)/g, "").trim()}`
  }
  return res
}

function cleanseRow(cols) {
  const [
    name,
    description,
    price,
    resolution,
    frameRate,
    fieldOfView,
    builtInMic,
    connection,
    featureI,
  ] = cols

  const iTag = normalizeCameraSpreadsheetITag(featureI)
  const iTags = iTag ? [iTag] : []

  return {
    name: name?.trim() ?? "",
    description: description?.trim() ?? "",
    price: parsePrice(price),
    resolution: isMissing(resolution) ? null : resolution.trim(),
    frameRate: isMissing(frameRate) ? null : frameRate.trim(),
    fieldOfView: isMissing(fieldOfView) ? null : fieldOfView.trim(),
    builtInMic: isMissing(builtInMic) ? null : builtInMic.trim(),
    connection: isMissing(connection) ? null : connection.trim(),
    iTags,
    resolutionHighlight: formatResolutionHighlight(resolution, frameRate),
    micHighlight: formatMicHighlight(builtInMic),
  }
}

function loadCsvRows() {
  const text = fs.readFileSync(CSV_PATH, "utf8").replace(/^\uFEFF/, "")
  const rows = []
  for (const line of text.trim().split(/\r?\n/).slice(1)) {
    if (!line.trim()) continue
    rows.push(cleanseRow(parseCsvLine(line)))
  }
  return rows
}

function modelKeys(gadget) {
  const keys = new Set()
  keys.add(norm(gadget.name))
  if (gadget.brand && gadget.brand !== "—") keys.add(norm(gadget.brand))

  for (const token of tokenize(`${gadget.name} ${gadget.brand}`)) {
    if (token.length >= 3 && !/webカメラ|カメラ|camera|4k|1080p|720p|2k|uhd|webcam/i.test(token)) {
      keys.add(token)
    }
  }

  for (const match of `${gadget.name} ${gadget.tagline}`.match(/[a-z]*\d{2,}[a-z0-9]*/gi) ?? []) {
    if (match.length >= 3) keys.add(norm(match))
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

  const genericName = /^(4k|2k|1080p|webカメラ|4kwebカメラ|fullhd)/i.test(norm(gadget.name))
  if (genericName && gadget.brand && gadget.brand !== "—" && csvHay.includes(norm(gadget.brand))) {
    score += 60
    if (gadget.price != null && row.price != null && gadget.price === row.price) score += 30
  }

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
  "cam-bs-006": (row) => /brio\s*100/i.test(row.name),
  "cam-bs-007": (row) => /brio\s*100/i.test(row.name),
  "cam-bs-011": (row) => /aoc/i.test(row.name) && row.price === 7219,
  "cam-bs-014": (row) => norm(row.name).includes("aocac310") && row.price === 5143,
  "cam-bs-051": (row) => norm(row.name) === norm("V02AF"),
  "cam-bs-061": (row) => /link\s*2\s*pro/i.test(row.name),
  "cam-bs-065": (row) => row.name.includes("400-CAM086"),
  "cam-bs-067": (row) => row.name.includes("400-CAM103"),
  "cam-bs-052": (row) => norm(row.name) === norm("V02AF"),
  "cam-bs-062": (row) => /link\s*2\s*pro/i.test(row.name),
  "cam-bs-066": (row) => row.name.includes("400-CAM086"),
  "cam-bs-068": (row) => row.name.includes("400-CAM103"),
  "cam-bs-070": (row) => norm(row.name) === norm("Tiny 3"),
  "cam-str-027-1hm3": (row) => norm(row.name) === norm("C960") && row.price === 2999,
  "cam-str-050-xk6r": (row) => /tiny\s*3\s*lite/i.test(row.name),
  "cam-str-097-vckw": (row) => /facecam\s*pro/i.test(row.name),
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

  if (block.includes("connection:")) {
    const next = block.replace(/(    connection: "[^"]*",\n)/, `$1${formatted}\n`)
    return { block: next, changed: true }
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

  if (row.price != null) {
    apply(replaceScalarField(next, "price", () => String(row.price)))
  }

  if (row.name) {
    apply(replaceQuotedField(next, "name", row.name))
  }

  if (row.description) {
    apply(replaceQuotedField(next, "tagline", row.description))
  }

  if (row.connection) {
    apply(replaceQuotedField(next, "connection", row.connection))
  }

  apply(replaceHighlightField(next, "解像度", row.resolutionHighlight))
  apply(replaceHighlightField(next, "画角", row.fieldOfView))
  apply(replaceHighlightField(next, "マイク", row.micHighlight))

  const specFields = [
    ["解像度", row.resolutionHighlight],
    ["フレームレート", row.frameRate],
    ["画角", row.fieldOfView],
    ["マイク", row.micHighlight],
    ["接続端子", row.connection],
  ]

  for (const [label, value] of specFields) {
    apply(replaceSpecField(next, label, value))
  }

  apply(replaceArrayField(next, "cameraSpreadsheetITags", row.iTags))

  return { block: next, changed }
}

function applyToFile(filePath, mapping) {
  let src = fs.readFileSync(filePath, "utf8")
  if (!src.includes('category: "camera"')) return 0

  let updated = 0
  const blockRe = /\{[\s\S]*?id: "([^"]+)"[\s\S]*?category: "camera"[\s\S]*?\n  \}(?:,|\n)/g

  src = src.replace(blockRe, (block, id) => {
    if (!CAMERA_IDS.has(id)) return block
    const entry = mapping.get(id)
    if (!entry) return block
    const { block: next, changed } = updateBlock(block, entry.row)
    if (changed) updated++
    return next
  })

  if (updated > 0) fs.writeFileSync(filePath, src)
  return updated
}

const gadgets = allSourceGadgets.filter((g) => g.category === "camera")
const rows = loadCsvRows()
const mapping = assignRowsToGadgets(gadgets, rows)

console.log(`CSV: ${CSV_PATH}`)
console.log(`CSV rows: ${rows.length}, camera gadgets: ${gadgets.length}`)
console.log(`Matched: ${mapping.size}`)

const unmatched = gadgets.filter((g) => !mapping.has(g.id))
if (unmatched.length > 0) {
  console.log(`Unmatched gadgets (${unmatched.length}):`)
  for (const g of unmatched) console.log(`  ${g.id} ${g.name}`)
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
