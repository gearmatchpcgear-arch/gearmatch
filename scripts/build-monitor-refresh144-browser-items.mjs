/**
 * Merge page1 + page2 browser scrape snapshots into monitor-refresh144-browser-items.json
 * Run after updating PAGE1_ITEMS / PAGE2_ITEMS from Amazon search scrape.
 */
import { writeFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { normalizeAmazonImageUrl } from "./amazon-image.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = join(__dirname, "monitor-refresh144-browser-items.json")

/** @type {typeof PAGE1_ITEMS} */
const PAGE1_ITEMS = JSON.parse(
  readJsonFile(join(__dirname, "monitor-refresh144-page1.json")),
)
/** @type {typeof PAGE1_ITEMS} */
const PAGE2_ITEMS = JSON.parse(
  readJsonFile(join(__dirname, "monitor-refresh144-page2.json")),
)

function readJsonFile(path) {
  return require("fs").readFileSync(path, "utf8")
}

const byAsin = new Map()
for (const item of [...PAGE1_ITEMS, ...PAGE2_ITEMS]) {
  if (!item.asin || item.asin.length !== 10) continue
  const prev = byAsin.get(item.asin)
  const rank = item.amazonRank ?? 999
  const page = item.searchPage ?? 1
  if (!prev || page < prev.searchPage || (page === prev.searchPage && rank < prev.amazonRank)) {
    byAsin.set(item.asin, {
      amazonRank: rank,
      asin: item.asin,
      title: item.title,
      price: item.price ?? null,
      image: item.image ? normalizeAmazonImageUrl(item.image) : "",
      searchPage: page,
    })
  }
}

const merged = [...byAsin.values()].sort((a, b) => {
  if (a.searchPage !== b.searchPage) return a.searchPage - b.searchPage
  return a.amazonRank - b.amazonRank
})

merged.forEach((item, i) => {
  item.amazonRank = i + 1
})

writeFileSync(OUT, JSON.stringify(merged, null, 2))
console.log(`Wrote ${OUT}: ${merged.length} unique items`)
