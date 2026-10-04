/**
 * Sync samplingRate / card / spec rows from LOCAL sources only.
 * Sources: AI_SPECS_KNOWN → local cache JSON → tagline → "—".
 * Does NOT fetch or scrape Amazon domains.
 * Usage: node scripts/fix-audio-interface-sampling-rates.mjs [--apply]
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { AI_SPECS_KNOWN, DASH } from "./audio-interface-specs-known.mjs"
import { inferSamplingRateFromTitle } from "./amazon-audio-interface-sampling-rate.mjs"

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const target = path.join(root, "lib/audio-interface-bestsellers.ts")
const cachePath = path.join(root, "scripts/audio-interface-sampling-rate-cache.json")
const reportPath = path.join(root, "scripts/audio-interface-sampling-rate-sync-report.json")
const apply = process.argv.includes("--apply")

const cache = fs.existsSync(cachePath)
  ? JSON.parse(fs.readFileSync(cachePath, "utf8"))
  : {}

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

function extractAsin(url) {
  return url?.match(/\/dp\/([A-Z0-9]{10})/i)?.[1]?.toUpperCase() ?? null
}

function parseFields(block) {
  return {
    id: block.match(/id: "([^"]+)"/)?.[1] ?? "",
    name: block.match(/name: "([^"]+)"/)?.[1] ?? "",
    tagline: block.match(/tagline: "([^"]+)"/)?.[1] ?? "",
    purchaseUrl: block.match(/purchaseUrl: "([^"]+)"/)?.[1] ?? "",
    samplingRate: block.match(/samplingRate: "([^"]*)"/)?.[1] ?? "",
    highlightRate: block.match(/\{ label: "サンプリングレート", value: "([^"]*)" \}/)?.[1],
  }
}

function replaceField(block, field, value) {
  const re = new RegExp(`(${field}: ")([^"]*)(")`)
  if (re.test(block)) return block.replace(re, `$1${value}$3`)
  return block
}

function updateHighlightRate(block, rate) {
  if (/\{ label: "サンプリングレート", value: "[^"]*" \}/.test(block)) {
    return block.replace(
      /\{ label: "サンプリングレート", value: "[^"]*" \}/,
      `{ label: "サンプリングレート", value: "${rate}" }`,
    )
  }
  return block
}

function updateSpecRateRow(block, rate) {
  if (/          \{ label: "サンプリングレート", value: "[^"]*" \},/.test(block)) {
    return block.replace(
      /          \{ label: "サンプリングレート", value: "[^"]*" \},/,
      `          { label: "サンプリングレート", value: "${rate}" },`,
    )
  }
  const bitRow = block.match(
    /(          \{ label: "ビット深度", value: "[^"]*" \},)/,
  )?.[1]
  if (bitRow) {
    return block.replace(bitRow, `          { label: "サンプリングレート", value: "${rate}" },\n${bitRow}`)
  }
  return block
}

function removeSpecRateRow(block) {
  return block.replace(/\n          \{ label: "サンプリングレート", value: "[^"]*" \},/, "")
}

function resolveTargetRate(asin, fields) {
  const known = asin ? AI_SPECS_KNOWN[asin] : null
  if (known?.samplingRate) return { rate: known.samplingRate, source: "AI_SPECS_KNOWN" }

  const cached = asin ? cache[asin] : null
  if (cached?.rate) return { rate: cached.rate, source: cached.source ?? "amazon-cache" }

  const fromTagline = inferSamplingRateFromTitle(fields.tagline)
  if (fromTagline !== DASH) return { rate: fromTagline, source: "tagline" }

  return { rate: DASH, source: "unknown" }
}

const text = fs.readFileSync(target, "utf8")
const blocks = parseGadgetBlocks(text)
const changes = []
let next = text
let offset = 0

for (const { start, end, text: block } of blocks) {
  if (!/category: "audio-interface"/.test(block)) continue

  const fields = parseFields(block)
  const asin = extractAsin(fields.purchaseUrl)
  const { rate, source } = resolveTargetRate(asin, fields)
  if (fields.samplingRate === rate) continue

  let updated = block
  updated = replaceField(updated, "samplingRate", rate)
  updated = updateHighlightRate(updated, rate)
  if (rate === DASH) {
    updated = removeSpecRateRow(updated)
  } else {
    updated = updateSpecRateRow(updated, rate)
  }

  changes.push({
    id: fields.id,
    name: fields.name,
    asin,
    before: fields.samplingRate,
    after: rate,
    source,
  })

  if (apply) {
    const absStart = start + offset
    const absEnd = end + offset
    next = next.slice(0, absStart) + updated + next.slice(absEnd)
    offset += updated.length - block.length
  }
}

fs.writeFileSync(
  reportPath,
  JSON.stringify(
    {
      mode: apply ? "apply" : "dry-run",
      changes: changes.length,
      dashed: changes.filter((c) => c.after === DASH).length,
      changeList: changes,
      generatedAt: new Date().toISOString(),
    },
    null,
    2,
  ) + "\n",
)

console.log(`${apply ? "Applied" : "Dry-run"}: ${changes.length} sampling rate syncs`)
for (const c of changes.slice(0, 40)) {
  console.log(`${c.id} ${c.name} | ${c.before} -> ${c.after} (${c.source})`)
}
if (changes.length > 40) console.log(`... and ${changes.length - 40} more`)

if (apply) {
  fs.writeFileSync(target, next, "utf8")
  console.log("\nApplied to lib/audio-interface-bestsellers.ts")
} else {
  console.log("\nDry run. Pass --apply to write.")
}
