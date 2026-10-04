/**
 * Import browser CDP scrape of mic search pages → mic-computers-search-raw.json
 * Usage: pass JSON array of { page, items: [...] } via stdin or file path arg
 */
import { readFileSync, writeFileSync, existsSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { normalizeAmazonImageUrl } from "./amazon-image.mjs"
import { isMicRankingBodyTitle } from "./mic-accessory-title.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_PATH = join(__dirname, "mic-computers-search-raw.json")

const SOURCE_URL =
  "https://www.amazon.co.jp/s?k=%E3%83%9E%E3%82%A4%E3%82%AF&i=computers&rh=n%3A2127209051%2Cp_n_g-101013572236111%3A17833758051&dc"

/** @type {{ page: number, items: Array<{ asin: string, title: string, price: number|null, rating: number|null, reviews: number|null, image: string }> }[]} */
let pages = []

const arg = process.argv[2]
if (arg && existsSync(arg)) {
  pages = JSON.parse(readFileSync(arg, "utf8"))
} else {
  const stdin = readFileSync(0, "utf8").trim()
  if (stdin) pages = JSON.parse(stdin)
}

if (!pages.length) {
  console.error("Usage: node import-mic-search-browser.mjs <pages.json>")
  process.exit(1)
}

const all = []
for (const { page, items } of pages) {
  for (const item of items) {
    all.push({
      amazonRank: (page - 1) * 48 + all.filter((x) => x.searchPage === page).length + 1,
      asin: item.asin.toUpperCase(),
      title: item.title,
      rating: item.rating ?? 4.0,
      reviews: item.reviews ?? 0,
      price: item.price ?? null,
      image: item.image ? normalizeAmazonImageUrl(item.image) : "",
      searchPage: page,
    })
  }
}

// Re-rank globally by page order
let rank = 0
const byAsin = new Map()
for (const pg of pages.sort((a, b) => a.page - b.page)) {
  const seenPage = new Set()
  for (const item of pg.items) {
    const asin = item.asin.toUpperCase()
    if (seenPage.has(asin)) continue
    seenPage.add(asin)
    rank++
    if (!byAsin.has(asin)) {
      byAsin.set(asin, {
        amazonRank: rank,
        asin,
        title: item.title,
        rating: item.rating ?? 4.0,
        reviews: item.reviews ?? 0,
        price: item.price ?? null,
        image: item.image ? normalizeAmazonImageUrl(item.image) : "",
        searchPage: pg.page,
      })
    }
  }
}

const raw = [...byAsin.values()].sort((a, b) => a.amazonRank - b.amazonRank)
const excluded = raw.filter((item) => isMicRankingBodyTitle(item.title))
const microphones = raw.filter((item) => !isMicRankingBodyTitle(item.title))

writeFileSync(
  OUT_PATH,
  JSON.stringify(
    {
      fetchedAt: new Date().toISOString(),
      sourceUrl: SOURCE_URL,
      totalPages: pages.length,
      microphones,
      excluded,
      raw,
    },
    null,
    2,
  ),
)

console.log(`Wrote ${microphones.length} mics, excluded ${excluded.length}, raw ${raw.length}`)
