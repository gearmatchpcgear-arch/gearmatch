/**
 * Browser-scraped gpro search page 3 → mouse-gpro-page3-raw.json
 * Usage: node scripts/import-mouse-gpro-page3-browser-data.mjs [cdp-json-path]
 */
import { readFileSync, writeFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { normalizeAmazonImageUrl } from "./amazon-image.mjs"
import { isGproGeneralSearchExcluded } from "./gpro-general-search-filter.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_PATH = join(__dirname, "mouse-gpro-page3-raw.json")
const SOURCE_URL = "https://www.amazon.co.jp/s?k=gpro&page=3"
const CDP_PATH =
  process.argv[2] ??
  "C:\\Users\\mnmap\\.cursor\\browser-logs\\cdp-response-Runtime.evaluate-2026-08-14T11-51-24-436Z.json"

function fixScrapedPrice(price) {
  if (price == null || price <= 0) return null
  if (price >= 10_000 && price % 10 === 0) {
    const corrected = price / 10
    if (corrected >= 800 && corrected <= 350_000) return Math.round(corrected)
  }
  if (price >= 100_000 && price % 10 === 0) {
    const corrected = price / 10
    if (corrected >= 800 && corrected <= 350_000) return Math.round(corrected)
  }
  return price >= 800 ? Math.round(price) : null
}

const cdp = JSON.parse(readFileSync(CDP_PATH, "utf8"))
const payload = cdp.result?.value ?? cdp
const items = payload.items ?? []

const byAsin = new Map()
for (const item of items) {
  const asin = item.asin?.toUpperCase()
  if (!asin) continue
  const normalized = {
    ...item,
    asin,
    price: fixScrapedPrice(item.price),
    image: normalizeAmazonImageUrl(item.image),
    reviews: item.reviews ?? 0,
    amazonRank: (item.pageRank ?? 0) + 96,
  }
  const prev = byAsin.get(asin)
  if (!prev || normalized.amazonRank < prev.amazonRank) {
    byAsin.set(asin, normalized)
  }
}

const raw = [...byAsin.values()].sort((a, b) => a.amazonRank - b.amazonRank)
const excluded = raw.filter((item) => isGproGeneralSearchExcluded(item.title))
const mice = raw
  .filter((item) => !isGproGeneralSearchExcluded(item.title))
  .map((item, i) => ({ ...item, rank: i + 1 }))

writeFileSync(
  OUT_PATH,
  JSON.stringify(
    {
      fetchedAt: new Date().toISOString(),
      sourceUrl: SOURCE_URL,
      searchPage: 3,
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
for (const x of excluded) {
  console.log(`  excluded: ${x.asin} ${x.title.slice(0, 72)}`)
}
for (const x of mice) {
  console.log(`  #${x.rank} ${x.asin} ¥${x.price ?? "?"} ${x.title.slice(0, 60)}`)
}
