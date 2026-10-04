/**
 * Write monitor-refresh144-page2-browser-items.json from embedded page-2 scrape.
 */
import { writeFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { normalizeAmazonImageUrl } from "./amazon-image.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = join(__dirname, "monitor-refresh144-page2-browser-items.json")
const BASE_URL =
  "https://www.amazon.co.jp/s?k=%E3%83%87%E3%82%A3%E3%82%B9%E3%83%97%E3%83%AC%E3%82%A4&rh=p_n_g-101013577303111%3A18161464051%257C18161468051%2Cp_n_g-101017397084111%3A214854498051%257C214854504051%257C214854509051%257C214854510051&dc&page=2"

/** @type {Array<{amazonRank:number,asin:string,title:string,price:number|null,image:string}>} */
const PAGE2 = JSON.parse(
  readJson(join(__dirname, "monitor-refresh144-page2-scrape.json")),
)

const items = PAGE2.map((item, i) => ({
  amazonRank: i + 1,
  asin: item.asin,
  title: item.title,
  price: item.price ?? null,
  image: item.image ? normalizeAmazonImageUrl(item.image) : "",
  searchPage: 2,
}))

writeFileSync(OUT, JSON.stringify(items, null, 2))
console.log(`Wrote ${OUT}: ${items.length} items (source: page 2)`)

function readJson(path) {
  return require("fs").readFileSync(path, "utf8")
}
