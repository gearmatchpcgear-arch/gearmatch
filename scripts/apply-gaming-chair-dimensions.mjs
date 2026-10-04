/**
 * Apply gaming-chair-dimensions-cache.json → lib/gaming-chair*.ts
 */
import { readFileSync, writeFileSync, existsSync, readdirSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { GAMING_CHAIR_DIMENSIONS_KNOWN } from "./gaming-chair-dimensions-known.mjs"

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..")
const CACHE_PATH = join(ROOT, "scripts", "gaming-chair-dimensions-cache.json")
const cache = existsSync(CACHE_PATH) ? JSON.parse(readFileSync(CACHE_PATH, "utf8")) : {}

const FIELDS = ["dimensions", "seatDepth", "seatWidth", "backrestWidth"]

function getDims(asin) {
  return mergeKnown(cache[asin], GAMING_CHAIR_DIMENSIONS_KNOWN[asin])
}

function mergeKnown(a, b) {
  const out = { ...(a ?? {}), ...(b ?? {}) }
  for (const k of FIELDS) {
    if (!out[k]) delete out[k]
  }
  delete out.source
  delete out.fetchedAt
  return out
}

function hasAnyDims(dims) {
  return FIELDS.some((f) => dims[f])
}

function stripDimensionProps(block) {
  let next = block
  for (const field of FIELDS) {
    next = next.replace(new RegExp(`\\n    ${field}: "[^"]*",?`, "g"), "")
  }
  return next
}

function injectDimensionProps(block, dims) {
  let next = stripDimensionProps(block)
  const lines = []
  for (const field of FIELDS) {
    if (dims[field]) lines.push(`    ${field}: "${dims[field]}",`)
  }
  if (lines.length === 0) return next
  return next.replace(/(\n    category: "gaming-chair",)/, `$1\n${lines.join("\n")}`)
}

function buildSizeSpecGroup(dims) {
  const rows = []
  if (dims.dimensions) rows.push(`          { label: "本体寸法", value: "${dims.dimensions}" },`)
  if (dims.seatDepth) rows.push(`          { label: "座面の奥行", value: "${dims.seatDepth}" },`)
  if (dims.seatWidth) rows.push(`          { label: "座面の幅", value: "${dims.seatWidth}" },`)
  if (dims.backrestWidth) rows.push(`          { label: "背もたれ幅", value: "${dims.backrestWidth}" },`)
  if (rows.length === 0) return null
  return `{ title: "サイズ / 寸法", rows: [\n${rows.join("\n")}\n        ]},`
}

function upsertSpecGroup(block, dims) {
  const group = buildSizeSpecGroup(dims)
  let next = block

  while (/\{ title: "サイズ \/ 寸法", rows: \[[\s\S]*?\]\s*\},?\n?/.test(next)) {
    next = next.replace(/\{ title: "サイズ \/ 寸法", rows: \[[\s\S]*?\]\s*\},?\n?/, "")
  }
  next = next.replace(
    /\{ title: "サイズ \/ 耐荷重", rows: \[[\s\S]*?\] \},?\n?/g,
    "",
  )

  if (!group) return next

  if (/specGroups: \[\s*\n/.test(next)) {
    return next.replace(/specGroups: \[\s*\n/, `specGroups: [\n      ${group}\n`)
  }
  return next
}

let blocks = 0
let files = 0

for (const file of readdirSync(join(ROOT, "lib"))) {
  if (!file.startsWith("gaming-chair") || !file.endsWith(".ts")) continue
  const path = join(ROOT, "lib", file)
  const original = readFileSync(path, "utf8")

  const blockRe =
    /\{[\s\S]*?category: "gaming-chair"[\s\S]*?purchaseUrl: "https:\/\/www\.amazon\.co\.jp\/dp\/([A-Z0-9]{10})"[\s\S]*?\n  \}(?:,|\n)/g

  let changed = false
  const out = original.replace(blockRe, (block, asin) => {
    const dims = getDims(asin)
    if (!hasAnyDims(dims)) {
      const stripped = stripDimensionProps(block)
      const noGroup = upsertSpecGroup(stripped, {})
      if (noGroup !== block) {
        blocks++
        changed = true
      }
      return noGroup
    }
    let next = injectDimensionProps(block, dims)
    next = upsertSpecGroup(next, dims)
    if (next !== block) {
      blocks++
      changed = true
    }
    return next
  })

  if (changed) {
    writeFileSync(path, out)
    files++
  }
}

console.log(`Applied dimensions to ${blocks} blocks in ${files} files`)
