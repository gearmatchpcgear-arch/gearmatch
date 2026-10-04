/**
 * Extract monitor search results from open Amazon tab via saved HTML snapshots,
 * or parse raw JSON produced by browser CDP extraction.
 *
 * Usage: node scripts/extract-monitor-search-from-json.mjs < input.json
 * input.json: array of page item arrays from CDP
 */
import { readFileSync, writeFileSync, existsSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { normalizeAmazonImageUrl } from "./amazon-image.mjs"
import { isMonitorAccessory } from "./fetch-monitor-bestsellers.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const IN_PATH = join(__dirname, "monitor-search-22-120-browser.json")
const OUT_PATH = join(__dirname, "monitor-search-22-120-raw.json")

if (!existsSync(IN_PATH)) {
  console.error(`Missing ${IN_PATH} — run browser extraction first`)
  process.exit(1)
}

const pages = JSON.parse(readFileSync(IN_PATH, "utf8"))
const all = []
const seen = new Set()

for (const pageItems of pages) {
  for (const item of pageItems) {
    const asin = String(item.asin || "").toUpperCase()
    if (!/^[A-Z0-9]{10}$/.test(asin) || seen.has(asin)) continue
    seen.add(asin)
    all.push({
      amazonRank: all.length + 1,
      asin,
      title: item.title || asin,
      rating: Number(item.rating) || 4.0,
      reviews: Number(item.reviews) || 0,
      price: item.price != null ? Number(String(item.price).replace(/,/g, "")) : null,
      image: item.image ? normalizeAmazonImageUrl(item.image) : "",
      searchPage: item.page ?? 1,
    })
  }
}

const excluded = all.filter((item) => isMonitorAccessory(item.title))
const monitors = all.filter((item) => !isMonitorAccessory(item.title))

writeFileSync(
  OUT_PATH,
  JSON.stringify(
    {
      fetchedAt: new Date().toISOString(),
      source: "browser-cdp",
      monitors,
      excluded,
      raw: all,
    },
    null,
    2,
  ),
)

console.log(`Wrote ${OUT_PATH}: kept=${monitors.length}, excluded=${excluded.length}`)
