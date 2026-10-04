/**
 * Browser-scraped Acer display search (18.0–25.9 inch) → monitor-acer-search-raw.json
 */
import { readFileSync, writeFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { normalizeAmazonImageUrl } from "./amazon-image.mjs"
import { isMonitorBody } from "./fetch-monitor-bestsellers.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_PATH = join(__dirname, "monitor-acer-search-raw.json")
const ITEMS_PATH = join(__dirname, "monitor-acer-search-browser-items.json")
const BASE_URL =
  "https://www.amazon.co.jp/s?k=%E3%83%87%E3%82%A3%E3%82%B9%E3%83%97%E3%83%AC%E3%82%A4&rh=p_n_g-101013577303111%3A18161464051%257C18161468051%2Cp_123%3A234478%257C247341%257C254596%257C338933"

function isAcerListing(title) {
  const t = title.toLowerCase()
  return /\bacer\b|alphaline|sigmaline/i.test(t)
}

const BROWSER_ITEMS = JSON.parse(readFileSync(ITEMS_PATH, "utf8"))

const raw = BROWSER_ITEMS.map((item) => ({
  ...item,
  rating: item.rating ?? 4.0,
  reviews: item.reviews ?? 0,
  image: item.image ? normalizeAmazonImageUrl(item.image) : "",
  searchPage: 1,
}))

const excluded = raw.filter((item) => !isMonitorBody(item.title) || !isAcerListing(item.title))
const monitors = raw.filter((item) => isMonitorBody(item.title) && isAcerListing(item.title))

writeFileSync(
  OUT_PATH,
  JSON.stringify(
    {
      fetchedAt: new Date().toISOString(),
      sourceUrl: BASE_URL,
      searchPage: 1,
      scrapeMethod: "browser",
      monitors,
      excluded,
      raw,
    },
    null,
    2,
  ),
)

console.log(`Wrote ${OUT_PATH}: kept=${monitors.length}, excluded=${excluded.length}`)
if (excluded.length) {
  for (const x of excluded) {
    console.log(`  excluded: ${x.asin} ${x.title.slice(0, 70)}`)
  }
}
