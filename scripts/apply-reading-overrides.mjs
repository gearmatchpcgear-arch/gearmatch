/**
 * Apply reading-overrides.json to mouse-specs-cache.json (no Amazon fetch).
 */
import { readFileSync, writeFileSync, existsSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const CACHE_PATH = join(__dirname, "mouse-specs-cache.json")
const OVERRIDES_PATH = join(__dirname, "reading-overrides.json")

const overrides = JSON.parse(readFileSync(OVERRIDES_PATH, "utf8"))
const cache = existsSync(CACHE_PATH)
  ? JSON.parse(readFileSync(CACHE_PATH, "utf8"))
  : {}

let updated = 0

for (const [asin, override] of Object.entries(overrides)) {
  const reading = override.reading
  if (!reading) continue

  if (!cache[asin]) {
    cache[asin] = {
      asin,
      title: asin,
      specs: { highlights: {}, sizeRows: [], sensorRows: [], powerRows: [] },
      fetchedAt: new Date().toISOString(),
    }
  }

  cache[asin].specs.highlights ??= {}
  cache[asin].specs.highlights.reading = reading
  cache[asin].specs.sensorRows ??= []

  const hasReading = cache[asin].specs.sensorRows.some((r) => r.label === "読み取り方式")
  if (hasReading) {
    cache[asin].specs.sensorRows = cache[asin].specs.sensorRows.map((r) =>
      r.label === "読み取り方式" ? { ...r, value: reading } : r,
    )
  } else {
    const insertAt = cache[asin].specs.sensorRows.findIndex((r) => r.label === "最大 DPI")
    const row = { label: "読み取り方式", value: reading }
    if (insertAt >= 0) cache[asin].specs.sensorRows.splice(insertAt + 1, 0, row)
    else cache[asin].specs.sensorRows.unshift(row)
  }

  updated++
}

writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2) + "\n")
console.log(`Applied reading overrides to ${updated} cache entries`)
