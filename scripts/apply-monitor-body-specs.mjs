/**
 * Apply monitor-body-specs-cache.json to monitor lib/*.ts files.
 */
import { readFileSync, writeFileSync, existsSync, readdirSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, "..")
const CACHE_PATH = join(__dirname, "monitor-body-specs-cache.json")
const DASH = "—"

if (!existsSync(CACHE_PATH)) {
  console.error("Run fetch-monitor-body-specs.mjs first")
  process.exit(1)
}

const cache = JSON.parse(readFileSync(CACHE_PATH, "utf8"))

function upsertSpecRow(block, label, value) {
  const rowRe = new RegExp(
    `(\\{ label: "${label}", value: )"[^"]*"( \\})`,
    "g",
  )
  if (rowRe.test(block)) {
    rowRe.lastIndex = 0
    return block.replace(rowRe, `$1${JSON.stringify(value)}$2`)
  }
  return null
}

function insertBodyGroup(block, dimVal, wtVal) {
  const bodyBlock = `
      { title: "本体", rows: [
          { label: "寸法", value: ${JSON.stringify(dimVal)} },
          { label: "重量", value: ${JSON.stringify(wtVal)} },
        ]},
`
  const insertRe = /(\n    specGroups: \[[\s\S]*?)(\n    \],)/
  const m = block.match(insertRe)
  if (!m) return block
  return block.replace(insertRe, `$1${bodyBlock}$2`)
}

function patchGadgetBlock(block, asin) {
  const entry = cache[asin]
  if (!entry) return block

  const currentDim = block.match(/label: "寸法", value: "([^"]*)"/)?.[1]
  const currentWt = block.match(/label: "重量", value: "([^"]*)"/)?.[1]

  const dimVal =
    entry.dimensions && entry.dimensions !== DASH
      ? entry.dimensions
      : currentDim && currentDim !== DASH
        ? currentDim
        : DASH
  const wtVal =
    entry.weight && entry.weight !== DASH
      ? entry.weight
      : currentWt && currentWt !== DASH
        ? currentWt
        : DASH
  const vesaVal =
    entry.vesaStandard && entry.vesaStandard !== DASH
      ? entry.vesaStandard
      : null

  let next = block
  const dimPatched = upsertSpecRow(next, "寸法", dimVal)
  if (dimPatched) next = dimPatched
  const wtPatched = upsertSpecRow(next, "重量", wtVal)
  if (wtPatched) next = wtPatched

  if (wtVal !== DASH) {
    const highlightWtRe = /(\{ label: "重量", value: )"[^"]*"(\s*\})/
    if (highlightWtRe.test(next)) {
      next = next.replace(highlightWtRe, `$1${JSON.stringify(wtVal)}$2`)
    }
  }

  if (!dimPatched || !wtPatched) {
    next = insertBodyGroup(next, dimVal, wtVal)
  }

  if (vesaVal) {
    const vesaLine = `    vesaStandard: ${JSON.stringify(vesaVal)},`
    if (/^\s*vesaStandard:/m.test(next)) {
      next = next.replace(/^\s*vesaStandard:.*$/m, vesaLine)
    } else {
      const purchaseMatch = next.match(/^\s*purchaseUrl:.*,\n/m)
      if (purchaseMatch) {
        const idx = next.indexOf(purchaseMatch[0]) + purchaseMatch[0].length
        next = next.slice(0, idx) + vesaLine + "\n" + next.slice(idx)
      }
    }
  }

  return next
}

function patchFile(filePath) {
  let src = readFileSync(filePath, "utf8")
  let changed = 0

  const blockRe =
    /(\{\s*\n\s*id: "[^"]+"[\s\S]*?purchaseUrl: "https:\/\/www\.amazon\.co\.jp\/dp\/([A-Z0-9]{10})"[\s\S]*?\n  \},)/g

  src = src.replace(blockRe, (block, _full, asin) => {
    if (!block.includes('category: "monitor"')) return block
    const next = patchGadgetBlock(block, asin)
    if (next !== block) changed++
    return next
  })

  if (changed > 0) writeFileSync(filePath, src)
  return changed
}

let total = 0
for (const file of readdirSync(join(ROOT, "lib")).filter(
  (f) => (f.startsWith("monitor-") && f.endsWith(".ts")) || f === "gadgets.ts",
)) {
  const n = patchFile(join(ROOT, "lib", file))
  if (n > 0) {
    console.log(`${file}: ${n}`)
    total += n
  }
}
console.log(`Total updated: ${total}`)
