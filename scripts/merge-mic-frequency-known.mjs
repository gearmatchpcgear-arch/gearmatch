/**
 * Merge MIC_FREQUENCY_KNOWN into cache (fill gaps only).
 */
import { readFileSync, writeFileSync, existsSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { formatFrequencyResponse, DASH } from "./amazon-mic-frequency-response.mjs"
import { MIC_FREQUENCY_KNOWN } from "./mic-frequency-known.mjs"

const CACHE_PATH = join(dirname(fileURLToPath(import.meta.url)), "mic-frequency-response-cache.json")
const cache = existsSync(CACHE_PATH) ? JSON.parse(readFileSync(CACHE_PATH, "utf8")) : {}

let merged = 0
for (const [asin, range] of Object.entries(MIC_FREQUENCY_KNOWN)) {
  const existing = cache[asin]
  if (existing?.highlight && existing.highlight !== DASH) continue
  cache[asin] = {
    ...(existing ?? {}),
    ...formatFrequencyResponse(range),
    source: "known",
    fetchedAt: new Date().toISOString(),
  }
  merged++
}

writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2))
const filled = Object.values(cache).filter((v) => v.highlight && v.highlight !== DASH).length
console.log(`Merged ${merged} known specs. Cache ${filled}/${Object.keys(cache).length} filled.`)
