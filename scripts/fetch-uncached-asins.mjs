/** Retry Node fetch for ASINs missing from cache. */
import { readFileSync, writeFileSync, existsSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { parseAmazonMouseSpecs } from "./amazon-mouse-specs.mjs"
import { parseAmazonPrice } from "./amazon-price.mjs"
import { cacheAmazonImageFromHtml } from "./amazon-image.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const CACHE_PATH = join(__dirname, "mouse-specs-cache.json")
const IMAGE_CACHE_PATH = join(__dirname, "mouse-image-cache.json")
const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/131.0.0.0",
  "Accept-Language": "ja-JP,ja;q=0.9",
}

const cache = JSON.parse(readFileSync(CACHE_PATH, "utf8"))
const imageCache = existsSync(IMAGE_CACHE_PATH)
  ? JSON.parse(readFileSync(IMAGE_CACHE_PATH, "utf8"))
  : {}
const asins = JSON.parse(readFileSync(join(__dirname, "need-fetch-asins.json"), "utf8")).needFetch.filter(
  (asin) => !cache[asin]?.specs,
)

console.log(`Fetching ${asins.length} uncached ASINs...`)
let ok = 0
let fail = 0

for (const asin of asins) {
  await new Promise((r) => setTimeout(r, 1200))
  try {
    const res = await fetch(`https://www.amazon.co.jp/dp/${asin}`, { headers: HEADERS })
    if (!res.ok) {
      fail++
      continue
    }
    const html = await res.text()
    if (!html.includes("productTitle")) {
      fail++
      continue
    }
    const title =
      html.match(/id="productTitle"[^>]*>([\s\S]*?)<\//)?.[1]?.replace(/\s+/g, " ").trim() ?? ""
    const price = parseAmazonPrice(html)
    cache[asin] = {
      asin,
      title,
      specs: parseAmazonMouseSpecs(html, title),
      price,
      fetchedAt: new Date().toISOString(),
      source: "node-fetch-retry",
    }
    cacheAmazonImageFromHtml(imageCache, asin, html, "node-fetch-retry")
    ok++
    if (ok % 10 === 0) {
      writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2) + "\n")
      writeFileSync(IMAGE_CACHE_PATH, JSON.stringify(imageCache, null, 2) + "\n")
      console.log(`  ok=${ok} fail=${fail}`)
    }
  } catch {
    fail++
  }
}

writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2) + "\n")
writeFileSync(IMAGE_CACHE_PATH, JSON.stringify(imageCache, null, 2) + "\n")
console.log(`Done: ok=${ok} fail=${fail}, cache=${Object.keys(cache).length}, images=${Object.keys(imageCache).length}`)
