/**
 * Parse browser CDP scrape JSON → mic-computers-search-raw.json
 * Usage: node parse-mic-search-cdp.mjs <cdp-response.json>
 */
import { readFileSync, writeFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { normalizeAmazonImageUrl } from "./amazon-image.mjs"
import { isMicRankingBodyTitle } from "./mic-accessory-title.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const cdpPath = process.argv[2]
if (!cdpPath) {
  console.error("Usage: node parse-mic-search-cdp.mjs <cdp-response.json>")
  process.exit(1)
}

const cdp = JSON.parse(readFileSync(cdpPath, "utf8"))
const jsonStr = cdp.result?.result?.value ?? cdp.result?.value
if (!jsonStr) {
  console.error("No result value in CDP file")
  process.exit(1)
}

const items = JSON.parse(jsonStr).map((item) => ({
  amazonRank: item.amazonRank,
  asin: item.asin.toUpperCase(),
  title: item.title,
  rating: item.rating ?? 4.0,
  reviews: item.reviews ?? 0,
  price: item.price ?? null,
  image: item.image ? normalizeAmazonImageUrl(item.image) : "",
  searchPage: item.searchPage,
}))

const excluded = items.filter((item) => isMicRankingBodyTitle(item.title))
const microphones = items.filter((item) => !isMicRankingBodyTitle(item.title))

const outPath = join(__dirname, "mic-computers-search-raw.json")
writeFileSync(
  outPath,
  JSON.stringify(
    {
      fetchedAt: new Date().toISOString(),
      sourceUrl:
        "https://www.amazon.co.jp/s?k=%E3%83%9E%E3%82%A4%E3%82%AF&i=computers&rh=n%3A2127209051%2Cp_n_g-101013572236111%3A17833758051&dc",
      source: "browser-cdp-scrape",
      totalItems: items.length,
      microphones,
      excluded,
      raw: items,
    },
    null,
    2,
  ),
)

console.log(`Wrote ${microphones.length} mics, excluded ${excluded.length}, raw ${items.length}`)
