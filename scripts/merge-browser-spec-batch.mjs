/**
 * Merge browser-fetched spec batches into mouse-specs-cache.json
 * Usage: node scripts/merge-browser-spec-batch.mjs <batch.json>
 */
import { readFileSync, writeFileSync, existsSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { parseAmazonMouseSpecs } from "./amazon-mouse-specs.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const CACHE_PATH = join(__dirname, "mouse-specs-cache.json")
const batchFile = process.argv[2]
if (!batchFile) {
  console.error("Usage: node scripts/merge-browser-spec-batch.mjs <batch.json>")
  process.exit(1)
}

const batch = JSON.parse(readFileSync(batchFile, "utf8"))
const cache = existsSync(CACHE_PATH)
  ? JSON.parse(readFileSync(CACHE_PATH, "utf8"))
  : {}

let added = 0
for (const entry of batch) {
  if (!entry.asin || !entry.html) continue
  const title =
    entry.title ||
    entry.html.match(/id="productTitle"[^>]*>([\s\S]*?)<\//)?.[1]?.replace(/\s+/g, " ").trim() ||
    ""
  const specs = parseAmazonMouseSpecs(entry.html, title)
  cache[entry.asin] = {
    asin: entry.asin,
    title,
    specs,
    fetchedAt: new Date().toISOString(),
    source: "browser-batch",
  }
  added++
}

writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2))
console.log(`Merged ${added} entries → ${CACHE_PATH} (total ${Object.keys(cache).length})`)
