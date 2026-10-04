/**
 * Fetch Amazon main images for products with placeholder/missing image URLs.
 */
import { readFileSync, writeFileSync, existsSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import {
  cacheAmazonImageFromHtml,
  collectGadgetAsinImages,
  needsImageFetch,
} from "./amazon-image.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, "..")
const CACHE_PATH = join(__dirname, "mouse-image-cache.json")
const OVERRIDES_PATH = join(__dirname, "mouse-overrides.json")
const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/131.0.0.0 Safari/537.36",
  "Accept-Language": "ja-JP,ja;q=0.9",
}

const cache = existsSync(CACHE_PATH)
  ? JSON.parse(readFileSync(CACHE_PATH, "utf8"))
  : {}
const overrides = existsSync(OVERRIDES_PATH)
  ? JSON.parse(readFileSync(OVERRIDES_PATH, "utf8"))
  : {}

const asins = collectGadgetAsinImages(ROOT)
const targets = [...asins.entries()].filter(([asin, image]) =>
  needsImageFetch(asin, image, cache, overrides),
)

console.log(`Placeholder/missing images: ${targets.length} / ${asins.size}`)

let fetched = 0
let failed = 0

for (const [asin] of targets) {
  if (
    cache[asin]?.image &&
    !needsImageFetch(asin, "", cache, overrides) &&
    !process.argv.includes("--refresh")
  ) {
    continue
  }

  await new Promise((r) => setTimeout(r, 900))
  try {
    const res = await fetch(`https://www.amazon.co.jp/dp/${asin}`, { headers: HEADERS })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const html = await res.text()
    const image = cacheAmazonImageFromHtml(cache, asin, html, "node-fetch")
    if (!image) throw new Error("no image in page")
    console.log(`OK  ${asin}`)
    console.log(`    ${image}`)
    fetched++
  } catch (e) {
    console.warn(`FAIL ${asin}: ${e.message}`)
    failed++
  }
}

writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2) + "\n")
console.log(`\nCache: ${Object.keys(cache).length}, fetched: ${fetched}, failed: ${failed}`)
