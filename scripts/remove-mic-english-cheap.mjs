/**
 * Remove mic entries where price <= 10000 AND all descriptive text is English-only (no Japanese).
 */
import { readFileSync, writeFileSync, readdirSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..")
const JP = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF\u3400-\u4DBF]/

function extractPrice(block) {
  const m = block.match(/price: (\d+|null)/)
  if (!m || m[1] === "null") return null
  return Number(m[1])
}

function extractListingText(block) {
  const name = block.match(/\n    name: "([^"]*)"/)?.[1] ?? ""
  const tagline = block.match(/\n    tagline: "([^"]*)"/)?.[1] ?? ""
  const brand = block.match(/\n    brand: "([^"]*)"/)?.[1] ?? ""
  return `${name} ${tagline} ${brand}`
}

function shouldRemoveBlock(block) {
  if (!block.includes('category: "mic"')) return false
  const price = extractPrice(block)
  if (price == null || price > 10000) return false
  return !JP.test(extractListingText(block))
}

const blockRe = /\{\n    id: "([^"]+)"[\s\S]*?\n  \},?\n/g

let totalRemoved = 0
const removedByFile = {}
const removedIds = []

for (const file of readdirSync(join(ROOT, "lib"))) {
  if (!file.endsWith(".ts")) continue
  const path = join(ROOT, "lib", file)
  const src = readFileSync(path, "utf8")
  if (!src.includes('category: "mic"')) continue

  let removed = 0
  const out = src.replace(blockRe, (block, id) => {
    if (!shouldRemoveBlock(block)) return block
    removed++
    removedIds.push({ id, file, price: extractPrice(block) })
    return ""
  })

  if (removed > 0) {
    writeFileSync(path, out)
    removedByFile[file] = removed
    totalRemoved += removed
  }
}

console.log(JSON.stringify({ totalRemoved, removedByFile }, null, 2))
if (process.argv.includes("--list")) {
  for (const r of removedIds.slice(0, 20)) {
    console.log(r.file, r.id, r.price)
  }
  if (removedIds.length > 20) console.log(`... ${removedIds.length - 20} more`)
}
