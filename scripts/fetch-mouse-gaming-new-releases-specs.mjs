/**
 * Fetch specs for ASINs in mouse-gaming-new-releases-raw.json
 */
import { readFileSync, writeFileSync, existsSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { parseAmazonMouseSpecs } from "./amazon-mouse-specs.mjs"
import { parseAmazonPrice } from "./amazon-price.mjs"
import { cacheAmazonImageFromHtml } from "./amazon-image.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const CACHE_PATH = join(__dirname, "mouse-specs-cache.json")
const IMAGE_CACHE_PATH = join(__dirname, "mouse-image-cache.json")
const RAW_PATH = process.argv.includes("--page2")
  ? join(__dirname, "mouse-gaming-new-releases-page2-raw.json")
  : join(__dirname, "mouse-gaming-new-releases-raw.json")

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/131.0.0.0 Safari/537.36",
  "Accept-Language": "ja-JP,ja;q=0.9",
}

async function fetchPage(asin, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(`https://www.amazon.co.jp/dp/${asin}`, { headers: HEADERS })
      if (!res.ok) {
        await new Promise((r) => setTimeout(r, 2000 * (i + 1)))
        continue
      }
      const html = await res.text()
      if (html.includes("prodDetSectionEntry") || html.includes("productTitle")) return html
    } catch {
      await new Promise((r) => setTimeout(r, 2000 * (i + 1)))
    }
  }
  return null
}

if (!existsSync(RAW_PATH)) {
  console.error("Run fetch-mouse-gaming-new-releases.mjs first")
  process.exit(1)
}

const raw = JSON.parse(readFileSync(RAW_PATH, "utf8"))
const asins = [...new Set(raw.mice.map((m) => m.asin))]
const cache = existsSync(CACHE_PATH) ? JSON.parse(readFileSync(CACHE_PATH, "utf8")) : {}
const imageCache = existsSync(IMAGE_CACHE_PATH)
  ? JSON.parse(readFileSync(IMAGE_CACHE_PATH, "utf8"))
  : {}

let fetched = 0
let failed = 0
for (const asin of asins) {
  if (cache[asin]?.specs && !process.argv.includes("--refresh")) continue
  console.log(`fetch ${asin}...`)
  await new Promise((r) => setTimeout(r, 1400))
  const html = await fetchPage(asin)
  if (!html) {
    console.warn(`  failed ${asin}`)
    failed++
    continue
  }
  const title =
    html.match(/id="productTitle"[^>]*>([\s\S]*?)<\//)?.[1]?.replace(/\s+/g, " ").trim() ?? ""
  const specs = parseAmazonMouseSpecs(html, title)
  const price = parseAmazonPrice(html)
  cache[asin] = { asin, title, specs, price, fetchedAt: new Date().toISOString() }
  cacheAmazonImageFromHtml(imageCache, asin, html, "fetch-mouse-gaming-new-releases-specs")
  writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2) + "\n")
  writeFileSync(IMAGE_CACHE_PATH, JSON.stringify(imageCache, null, 2) + "\n")
  fetched++
}

console.log(`done: fetched ${fetched}, failed ${failed}, total cache ${Object.keys(cache).length}`)
