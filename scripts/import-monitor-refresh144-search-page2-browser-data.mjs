/**
 * Browser-scraped 144–240Hz display search page 2 → monitor-refresh144-search-page2-raw.json
 */
import { readFileSync, writeFileSync, existsSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { normalizeAmazonImageUrl } from "./amazon-image.mjs"
import { isMonitorBody } from "./fetch-monitor-bestsellers.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_PATH = join(__dirname, "monitor-refresh144-search-page2-raw.json")
const ITEMS_PATH = join(__dirname, "monitor-refresh144-page2-browser-items.json")
const BASE_URL =
  "https://www.amazon.co.jp/s?k=%E3%83%87%E3%82%A3%E3%82%B9%E3%83%97%E3%83%AC%E3%82%A4&rh=p_n_g-101013577303111%3A18161464051%257C18161468051%2Cp_n_g-101017397084111%3A214854498051%257C214854504051%257C214854509051%257C214854510051&dc&page=2"

if (!existsSync(ITEMS_PATH)) {
  console.error("Run write_page2_scrape.py first")
  process.exit(1)
}

const BROWSER_ITEMS = JSON.parse(readFileSync(ITEMS_PATH, "utf8"))

const raw = BROWSER_ITEMS.map((item) => ({
  ...item,
  rating: item.rating ?? 4.0,
  reviews: item.reviews ?? 0,
  image: item.image ? normalizeAmazonImageUrl(item.image) : "",
}))

const excluded = raw.filter((item) => !isMonitorBody(item.title))
const monitors = raw.filter((item) => isMonitorBody(item.title))

writeFileSync(
  OUT_PATH,
  JSON.stringify(
    {
      fetchedAt: new Date().toISOString(),
      sourceUrl: BASE_URL,
      scrapeMethod: "browser+fetch",
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
    console.log(`  excluded: ${x.asin} ${x.title.slice(0, 80)}`)
  }
}
