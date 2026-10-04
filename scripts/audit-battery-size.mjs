/**
 * Detect cache entries where stored power (単3/単4) conflicts with
 * batteryContext extracted from product description.
 */
import { readFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const CACHE_PATH = join(__dirname, "mouse-specs-cache.json")
const cache = JSON.parse(readFileSync(CACHE_PATH, "utf8"))

const mismatches = []

for (const [asin, entry] of Object.entries(cache)) {
  const power = entry.specs?.powerRows?.find((r) => r.label === "電源")?.value ?? ""
  const powerSize = power.match(/単([1234])形/)?.[1]
  const ctx = entry.specs?.meta?.batteryContext
  if (!powerSize || !ctx?.size || ctx.confidence < 80) continue
  if (powerSize !== ctx.size) {
    mismatches.push({
      asin,
      power,
      ctxSize: ctx.size,
      ctxCount: ctx.count,
      source: ctx.source,
      title: (entry.title ?? "").slice(0, 80),
    })
  }
}

console.log(`Battery size mismatches: ${mismatches.length}`)
for (const m of mismatches) {
  console.log(`${m.asin} | power=${m.power} | context=単${m.ctxSize}形 (${m.source})`)
  console.log(`  ${m.title}`)
}

process.exit(mismatches.length > 0 ? 1 : 0)
