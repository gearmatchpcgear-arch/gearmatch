/**
 * Apply mic-frequency-response-cache.json → lib/mic-*.ts + gadgets.ts
 */
import { readFileSync, writeFileSync, existsSync, readdirSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { DASH } from "./amazon-mic-frequency-response.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, "..")
const CACHE_PATH = join(__dirname, "mic-frequency-response-cache.json")

if (!existsSync(CACHE_PATH)) {
  console.error("Run: node scripts/fetch-mic-frequency-response.mjs")
  process.exit(1)
}

const cache = JSON.parse(readFileSync(CACHE_PATH, "utf8"))
const freqRe = /(\{ label: "周波数特性", value: ")[^"]*(" \})/g

function updateBlock(block, data) {
  let changed = false
  let next = block

  const hlStart = block.indexOf("highlights:")
  const hlEnd = hlStart === -1 ? -1 : block.indexOf("],", hlStart)
  if (hlStart !== -1 && hlEnd !== -1) {
    const hl = block.slice(hlStart, hlEnd + 2)
    const newHl = hl.replace(freqRe, (match, p1, p2) => {
      if (match.includes(data.highlight)) return match
      changed = true
      return `${p1}${data.highlight}${p2}`
    })
    next = block.slice(0, hlStart) + newHl + block.slice(hlEnd + 2)
  }

  const specStart = next.indexOf("specGroups:")
  if (specStart !== -1) {
    const specPart = next.slice(specStart)
    const newSpec = specPart.replace(freqRe, (match, p1, p2) => {
      if (match.includes(data.spec)) return match
      changed = true
      return `${p1}${data.spec}${p2}`
    })
    next = next.slice(0, specStart) + newSpec
  }

  return { next, changed }
}

function applyToSource(src) {
  let updatedBlocks = 0
  const blockRe =
    /\{[\s\S]*?category: "mic"[\s\S]*?purchaseUrl: "https:\/\/www\.amazon\.co\.jp\/dp\/([A-Z0-9]{10})"[\s\S]*?\n  \}(?:,|\n)/g

  const out = src.replace(blockRe, (block, asin) => {
    const data = cache[asin]
    if (!data?.highlight || data.highlight === DASH) return block
    const { next, changed } = updateBlock(block, data)
    if (changed) updatedBlocks++
    return next
  })

  return { src: out, updatedBlocks }
}

let total = 0
for (const file of readdirSync(join(ROOT, "lib"))) {
  if (!file.endsWith(".ts")) continue
  const path = join(ROOT, "lib", file)
  const src = readFileSync(path, "utf8")
  if (!src.includes('category: "mic"')) continue
  const { src: next, updatedBlocks } = applyToSource(src)
  if (updatedBlocks > 0) {
    writeFileSync(path, next)
    console.log(`${file}: ${updatedBlocks} blocks updated`)
    total += updatedBlocks
  }
}

console.log(`Total blocks updated: ${total}`)
