/**
 * Merge monitor-body-browser-batch-*.json into monitor-body-specs-cache.json
 */
import { readFileSync, writeFileSync, existsSync, readdirSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { DASH } from "./amazon-monitor-body-specs.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const CACHE_PATH = join(__dirname, "monitor-body-specs-cache.json")
const cache = existsSync(CACHE_PATH)
  ? JSON.parse(readFileSync(CACHE_PATH, "utf8"))
  : {}

let merged = 0
for (const file of readdirSync(__dirname)) {
  if (!/^monitor-body-browser-batch-\d+\.json$/.test(file)) continue
  const batch = JSON.parse(readFileSync(join(__dirname, file), "utf8"))
  for (const item of batch) {
    if (!item?.asin) continue
    const prev = cache[item.asin] ?? {}
    const next = { ...prev, asin: item.asin, fetchedAt: new Date().toISOString(), source: "browser-batch" }
    if (item.dimensions && item.dimensions !== DASH) next.dimensions = item.dimensions
    if (item.weight && item.weight !== DASH) next.weight = item.weight
    if (next.dimensions !== prev.dimensions || next.weight !== prev.weight) merged++
    cache[item.asin] = next
  }
}

writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2) + "\n")
console.log(`Merged browser batches. Updated entries: ${merged}`)
