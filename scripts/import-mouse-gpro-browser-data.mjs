/**
 * Browser-scraped gpro search → mouse-g-pro-search-raw.json
 * Usage: node scripts/import-mouse-gpro-browser-data.mjs [cdp-json-path]
 */
import { readFileSync, writeFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { normalizeAmazonImageUrl } from "./amazon-image.mjs"
import { isGProSearchExcluded } from "./g-pro-search-filter.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_PATH = join(__dirname, "mouse-g-pro-search-raw.json")
const BASE_URL = "https://www.amazon.co.jp/gpro/s?k=gpro"
const CDP_PATH =
  process.argv[2] ??
  "C:\\Users\\mnmap\\.cursor\\browser-logs\\cdp-response-Runtime.evaluate-2026-08-14T11-41-21-491Z.json"

const cdp = JSON.parse(readFileSync(CDP_PATH, "utf8"))
const items = cdp.result?.value?.items ?? cdp.items ?? []

const byAsin = new Map()
for (const item of items) {
  const prev = byAsin.get(item.asin)
  if (!prev || item.amazonRank < prev.amazonRank) {
    byAsin.set(item.asin, {
      ...item,
      image: normalizeAmazonImageUrl(item.image),
      reviews: item.reviews ?? 0,
    })
  }
}

const raw = [...byAsin.values()].sort((a, b) => a.amazonRank - b.amazonRank)
const excluded = raw.filter((item) => isGProSearchExcluded(item.title))
const mice = raw
  .filter((item) => !isGProSearchExcluded(item.title))
  .map((item, i) => ({ ...item, rank: i + 1 }))

writeFileSync(
  OUT_PATH,
  JSON.stringify(
    {
      fetchedAt: new Date().toISOString(),
      sourceUrl: BASE_URL,
      totalPages: 1,
      scrapeMethod: "browser",
      mice,
      excluded,
      raw,
    },
    null,
    2,
  ),
)

console.log(`Wrote ${OUT_PATH}: kept=${mice.length}, excluded=${excluded.length}`)
for (const x of excluded.slice(0, 15)) {
  console.log(`  excluded: ${x.asin} ${x.title.slice(0, 70)}`)
}
