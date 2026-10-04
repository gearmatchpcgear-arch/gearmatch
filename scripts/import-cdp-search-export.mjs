/**
 * Import combined browser CDP export into monitor-search-22-120-raw.json
 * Usage: node scripts/import-cdp-search-export.mjs <cdp-response.json>
 */
import { readFileSync, writeFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { normalizeAmazonImageUrl } from "./amazon-image.mjs"
import { isMonitorAccessory } from "./fetch-monitor-bestsellers.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const cdpPath = process.argv[2]
if (!cdpPath) {
  console.error("Usage: node scripts/import-cdp-search-export.mjs <cdp-response.json>")
  process.exit(1)
}

const cdp = JSON.parse(readFileSync(cdpPath, "utf8"))
const items = JSON.parse(cdp.result.value)

const all = items.map((item, index) => ({
  amazonRank: index + 1,
  asin: item.asin,
  title: item.title,
  rating: item.rating ?? 4,
  reviews: item.reviews ?? 0,
  price: item.price ?? null,
  image: item.image ? normalizeAmazonImageUrl(item.image) : "",
  searchPage: item.page ?? 1,
}))

const excluded = all.filter((item) => isMonitorAccessory(item.title))
const monitors = all.filter((item) => !isMonitorAccessory(item.title))

const OUT_PATH = join(__dirname, "monitor-search-22-120-raw.json")
writeFileSync(
  OUT_PATH,
  JSON.stringify(
    {
      fetchedAt: new Date().toISOString(),
      source: "browser-cdp-all-pages",
      sourceUrl:
        "https://www.amazon.co.jp/s?k=%E3%83%87%E3%82%A3%E3%82%B9%E3%83%97%E3%83%AC%E3%82%A4&rh=p_n_g-101017397084111%3A214854510051%2Cp_n_g-101013577303111%3A18161464051",
      monitors,
      excluded,
      raw: all,
    },
    null,
    2,
  ),
)

console.log(`Wrote ${OUT_PATH}: kept=${monitors.length}, excluded=${excluded.length}, total=${all.length}`)
