/**
 * Re-validate dimensions in monitor-body-specs-cache.json
 */
import { readFileSync, writeFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { validateDimensions, DASH } from "./amazon-monitor-body-specs.mjs"

const cachePath = join(dirname(fileURLToPath(import.meta.url)), "monitor-body-specs-cache.json")
const cache = JSON.parse(readFileSync(cachePath, "utf8"))
let fixed = 0
for (const entry of Object.values(cache)) {
  if (!entry.dimensions || entry.dimensions === DASH) continue
  const next = validateDimensions(entry.dimensions)
  if (next !== entry.dimensions) {
    entry.dimensions = next
    fixed++
  }
}
writeFileSync(cachePath, JSON.stringify(cache, null, 2) + "\n")
console.log(`Invalid dimensions cleared: ${fixed}`)
