/**
 * Bulk-fix gaming chair dimensions to D × W × H (奥行 × 幅 × 高さ).
 * Usage: node scripts/fix-gaming-chair-dimension-dwh-order.mjs [--write]
 */
import { readFileSync, writeFileSync, readdirSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { GAMING_CHAIR_DIMENSIONS_KNOWN } from "./gaming-chair-dimensions-known.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, "..")
const LIB = join(ROOT, "lib")
const WRITE = process.argv.includes("--write")

function parseTriple(raw) {
  const m = String(raw).match(/([\d.]+)\s*×\s*([\d.]+)\s*×\s*([\d.]+)\s*cm/i)
  if (!m) return null
  return [parseFloat(m[1]), parseFloat(m[2]), parseFloat(m[3])]
}

function formatTriple(d, w, h) {
  const fmt = (n) => (Number.isInteger(n) ? String(Math.round(n)) : String(n))
  return `${fmt(d)} × ${fmt(w)} × ${fmt(h)} cm`
}

function parseCmNum(raw) {
  if (!raw) return null
  const m = String(raw).match(/([\d.]+)/)
  return m ? parseFloat(m[1]) : null
}

function approx(a, b, tol = 0.75) {
  return Math.abs(a - b) <= tol
}

function normalizeDimensionStringToDWH(raw, hints = {}) {
  const base = String(raw).split(/\s*\/\s*/)[0]?.trim() ?? ""
  const triple = parseTriple(base)
  if (!triple) return null

  let [d, w, h] = triple
  const seatDepth = parseCmNum(hints.seatDepth)
  const seatWidth = parseCmNum(hints.seatWidth)
  const hay = `${hints.name ?? ""} ${hints.tagline ?? ""}`

  if (seatDepth != null && seatWidth != null) {
    if (approx(d, seatWidth) && approx(w, seatDepth)) {
      d = seatDepth
      w = seatWidth
    }
  }

  const depthFirst = hay.match(/奥行(?:き|)?\s*([\d.]+)(?:\s*cm)?[^×]{0,24}幅\s*([\d.]+)/i)
  const widthFirst = hay.match(/幅\s*([\d.]+)(?:\s*cm)?[^×]{0,24}奥行(?:き|)?\s*([\d.]+)/i)
  if (depthFirst) {
    const hintD = parseFloat(depthFirst[1])
    const hintW = parseFloat(depthFirst[2])
    if (approx(d, hintW) && approx(w, hintD)) {
      d = hintD
      w = hintW
    }
  } else if (widthFirst) {
    const hintW = parseFloat(widthFirst[1])
    const hintD = parseFloat(widthFirst[2])
    if (approx(d, hintW) && approx(w, hintD)) {
      d = hintD
      w = hintW
    } else if (seatDepth == null && seatWidth == null) {
      d = hintD
      w = hintW
    }
  }

  return formatTriple(d, w, h)
}

function replaceTripleInValue(value, normalized) {
  const base = String(value).split(/\s*\/\s*/)[0]?.trim() ?? ""
  if (!parseTriple(base)) return value
  const suffix = value.includes("/") ? value.slice(base.length) : ""
  return normalized + suffix
}

function extractField(block, field) {
  const re = new RegExp(`\\b${field}:\\s*"([^"]*)"`)
  const m = block.match(re)
  return m?.[1] ?? null
}

function extractAsin(block) {
  const m = block.match(/purchaseUrl:\s*"https:\/\/www\.amazon\.co\.jp\/dp\/([A-Z0-9]{10})"/)
  return m?.[1] ?? null
}

function patchField(block, field, newValue) {
  const re = new RegExp(`(\\b${field}:\\s*")([^"]*)(")`)
  if (!re.test(block)) return block
  return block.replace(re, `$1${newValue}$3`)
}

function patchBodyDimensionRow(block, normalized) {
  return block.replace(
    /(\{ label: "本体寸法", value: ")([^"]*)(" \})/g,
    (full, pre, val, post) => {
      const next = replaceTripleInValue(val, normalized)
      return next === val ? full : `${pre}${next}${post}`
    },
  )
}

function patchDimensionHighlights(block, normalized) {
  return block.replace(
    /(\{ label: "寸法\/重量", value: ")([^"]*)(" \})/g,
    (full, pre, val, post) => {
      const next = replaceTripleInValue(val, normalized)
      return next === val ? full : `${pre}${next}${post}`
    },
  )
}

function processFile(filePath) {
  const src = readFileSync(filePath, "utf8")
  if (!src.includes('category: "gaming-chair"')) return { filePath, changes: [] }

  const blocks = src.split(/(?=\n  \{\n    id: )/)
  let changed = false
  const changes = []

  const out = blocks.map((block, idx) => {
    if (idx === 0 || !block.includes('category: "gaming-chair"')) return block

    const asin = extractAsin(block)
    const known = asin ? GAMING_CHAIR_DIMENSIONS_KNOWN[asin] : null
    const hints = {
      seatDepth: known?.seatDepth ?? extractField(block, "seatDepth"),
      seatWidth: known?.seatWidth ?? extractField(block, "seatWidth"),
      name: extractField(block, "name"),
      tagline: extractField(block, "tagline"),
    }

    const blockDimensions = extractField(block, "dimensions")
    if (!blockDimensions && !known?.dimensions) return block

    let target = null
    if (known?.dimensions) {
      target =
        normalizeDimensionStringToDWH(known.dimensions, hints) ??
        known.dimensions.split(/\s*\/\s*/)[0]?.trim()
    } else {
      target = normalizeDimensionStringToDWH(blockDimensions, hints)
    }
    if (!target) return block

    const currentBase = blockDimensions?.split(/\s*\/\s*/)[0]?.trim()
    const bodyMatch = block.match(/\{ label: "本体寸法", value: "([^"]*)"/)
    const bodyRaw = bodyMatch?.[1]
    const bodyBase = bodyRaw?.split(/\s*\/\s*/)[0]?.trim()
    if (currentBase === target && bodyBase === target) return block

    let next = block
    if (blockDimensions) next = patchField(next, "dimensions", target)
    else if (known?.dimensions) next = patchField(next, "dimensions", target)
    next = patchBodyDimensionRow(next, target)
    next = patchDimensionHighlights(next, target)
    changes.push({ asin, from: blockDimensions ?? bodyRaw ?? "?", to: target })
    changed = true
    return next
  })

  if (changed && WRITE) {
    writeFileSync(filePath, out.join(""), "utf8")
  }

  return { filePath, changes, changed }
}

const files = readdirSync(LIB)
  .filter((f) => f.startsWith("gaming-chair") && f.endsWith(".ts"))
  .map((f) => join(LIB, f))

let total = 0
for (const filePath of files) {
  const { changes, changed } = processFile(filePath)
  if (changes.length) {
    console.log(`\n${filePath.replace(ROOT + "\\", "")} (${changed && WRITE ? "written" : "dry-run"})`)
    for (const c of changes) {
      console.log(`  ${c.asin ?? "?"}: ${c.from} → ${c.to}`)
      total++
    }
  }
}

console.log(`\n${total} dimension value(s) ${WRITE ? "updated" : "would update"}.`)
if (!WRITE) console.log("Re-run with --write to apply.")
