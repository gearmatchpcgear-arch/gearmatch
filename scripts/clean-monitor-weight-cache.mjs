/**
 * Reset implausible monitor weights in cache to — using validateMonitorWeight.
 */
import { readFileSync, writeFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { validateMonitorWeight, DASH } from "./amazon-monitor-body-specs.mjs"

const cachePath = join(dirname(fileURLToPath(import.meta.url)), "monitor-body-specs-cache.json")
const cache = JSON.parse(readFileSync(cachePath, "utf8"))

let cleaned = 0
for (const [asin, entry] of Object.entries(cache)) {
  if (!entry?.weight || entry.weight === DASH) continue
  const validated = validateMonitorWeight(entry.weight, entry.dimensions ?? DASH)
  if (validated === DASH) {
    cache[asin] = { ...entry, weight: DASH }
    cleaned++
  }
}

writeFileSync(cachePath, JSON.stringify(cache, null, 2) + "\n")
console.log(`Cleaned implausible weights: ${cleaned}`)
