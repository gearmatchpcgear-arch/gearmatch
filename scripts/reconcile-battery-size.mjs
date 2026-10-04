/**
 * Re-fetch Amazon pages for cache entries whose power says 単4,
 * compare with description/spec text, and fix 単3/単4 mismatches.
 */
import { readFileSync, writeFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { parseAmazonMouseSpecs, extractBatteryFromContext } from "./amazon-mouse-specs.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const CACHE_PATH = join(__dirname, "mouse-specs-cache.json")
const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/131.0.0.0",
  "Accept-Language": "ja-JP,ja;q=0.9",
}

const cache = JSON.parse(readFileSync(CACHE_PATH, "utf8"))
const targets = Object.entries(cache).filter(([, e]) =>
  /単4形/.test(e.specs?.powerRows?.find((r) => r.label === "電源")?.value ?? ""),
)

console.log(`Checking ${targets.length} entries with 単4 power...`)

let fixed = 0
let ok = 0
let failed = 0

for (const [asin, entry] of targets) {
  await new Promise((r) => setTimeout(r, 1400))
  try {
    const res = await fetch(`https://www.amazon.co.jp/dp/${asin}`, { headers: HEADERS })
    if (!res.ok) {
      failed++
      continue
    }
    const html = await res.text()
    const title = entry.title ?? ""
    const ctx = extractBatteryFromContext(html, title)
    const specs = parseAmazonMouseSpecs(html, title)
    const nextPower = specs.powerRows.find((r) => r.label === "電源")?.value
    const prevPower = entry.specs.powerRows.find((r) => r.label === "電源")?.value

    if (nextPower && nextPower !== prevPower) {
      entry.specs.powerRows.find((r) => r.label === "電源").value = nextPower
      if (ctx) entry.specs.meta = { ...entry.specs.meta, batteryContext: ctx }
      console.log(`FIX ${asin}: ${prevPower} -> ${nextPower}`)
      fixed++
    } else {
      console.log(`OK  ${asin}: ${prevPower}${ctx ? ` (ctx: 単${ctx.size}形)` : ""}`)
      ok++
    }
  } catch (e) {
    console.warn(`FAIL ${asin}:`, e.message)
    failed++
  }
}

writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2) + "\n")
console.log(`\nFixed: ${fixed}, unchanged: ${ok}, failed: ${failed}`)
