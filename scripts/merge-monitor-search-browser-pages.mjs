/**
 * Merge browser-extracted search pages into monitor-search-22-120-raw.json
 * Run after saving page JSON files from browser CDP:
 *   monitor-search-22-120-page1.json … page3.json
 */
import { readFileSync, writeFileSync, existsSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { normalizeAmazonImageUrl } from "./amazon-image.mjs"
import { isMonitorAccessory } from "./fetch-monitor-bestsellers.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_PATH = join(__dirname, "monitor-search-22-120-raw.json")

const pageFiles = [1, 2, 3].map((n) =>
  join(__dirname, `monitor-search-22-120-page${n}.json`),
)

const all = []
const seen = new Set()

for (const file of pageFiles) {
  if (!existsSync(file)) {
    console.warn(`Skip missing ${file}`)
    continue
  }
  const pageItems = JSON.parse(readFileSync(file, "utf8"))
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

console.log(`Wrote ${OUT_PATH}: kept=${monitors.length}, excluded=${excluded.length}, unique=${all.length}`)
