/**
 * Merge browser CDP batch JSON into monitor-body-specs-cache.json
 * Usage: node scripts/import-monitor-body-batch.mjs <batch.json>
 */
import { readFileSync, writeFileSync, existsSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { validateDimensions, DASH } from "./amazon-monitor-body-specs.mjs"

const batchFile = process.argv[2]
if (!batchFile) {
  console.error("Usage: node scripts/import-monitor-body-batch.mjs <batch.json>")
  process.exit(1)
}

const cachePath = join(dirname(fileURLToPath(import.meta.url)), "monitor-body-specs-cache.json")
const cache = existsSync(cachePath) ? JSON.parse(readFileSync(cachePath, "utf8")) : {}
const batch = JSON.parse(readFileSync(batchFile, "utf8"))

let merged = 0
for (const entry of batch) {
  if (!entry?.asin) continue
  cache[entry.asin] = {
    asin: entry.asin,
    dimensions: validateDimensions(entry.dimensions ?? DASH),
    weight: entry.weight ?? DASH,
    fetchedAt: new Date().toISOString(),
    source: "browser-cdp",
  }
  merged++
}

writeFileSync(cachePath, JSON.stringify(cache, null, 2) + "\n")
console.log(`Merged ${merged} entries into cache`)
