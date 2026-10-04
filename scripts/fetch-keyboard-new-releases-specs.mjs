/**
 * Fetch Amazon JP keyboard new release product specs → keyboard-new-releases-specs-cache.json
 * Also updates shared keyboard-image-cache.json
 */
import { readFileSync, writeFileSync, existsSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { parseAmazonKeyboardSpecs } from "./amazon-keyboard-specs.mjs"
import { parseAmazonPrice } from "./amazon-price.mjs"
import { cacheAmazonImageFromHtml } from "./amazon-image.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const CACHE_PATH = join(__dirname, "keyboard-new-releases-specs-cache.json")
const SHARED_CACHE_PATH = join(__dirname, "keyboard-specs-cache.json")
const IMAGE_CACHE_PATH = join(__dirname, "keyboard-image-cache.json")
const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/131.0.0.0 Safari/537.36",
  "Accept-Language": "ja-JP,ja;q=0.9",
}

function collectAsins() {
  const rawPath = join(__dirname, "keyboard-new-releases-raw.json")
  if (!existsSync(rawPath)) return []
  const { keyboards } = JSON.parse(readFileSync(rawPath, "utf8"))
  return keyboards.map((k) => k.asin)
}

async function fetchPage(asin, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(`https://www.amazon.co.jp/dp/${asin}`, {
        headers: HEADERS,
      })
      if (!res.ok) {
        await new Promise((r) => setTimeout(r, 2000 * (i + 1)))
        continue
      }
      const html = await res.text()
      if (html.includes("productTitle") || html.includes("prodDetSectionEntry")) return html
    } catch {
      await new Promise((r) => setTimeout(r, 2000 * (i + 1)))
    }
  }
  return null
}

const cache = existsSync(CACHE_PATH)
  ? JSON.parse(readFileSync(CACHE_PATH, "utf8"))
  : {}
const sharedCache = existsSync(SHARED_CACHE_PATH)
  ? JSON.parse(readFileSync(SHARED_CACHE_PATH, "utf8"))
  : {}
const imageCache = existsSync(IMAGE_CACHE_PATH)
  ? JSON.parse(readFileSync(IMAGE_CACHE_PATH, "utf8"))
  : {}

async function main() {
  const asins = collectAsins()
  console.log(`Fetching ${asins.length} ASINs…`)
  let fetched = 0
  for (const asin of asins) {
    if (cache[asin]?.specs && !process.argv.includes("--refresh")) continue
    const html = await fetchPage(asin)
    if (!html) {
      console.warn(`  skip ${asin}: no html`)
      await new Promise((r) => setTimeout(r, 1500))
      continue
    }
    const specs = parseAmazonKeyboardSpecs(html)
    const price = parseAmazonPrice(html)
    const entry = {
      specs,
      price,
      title: specs.title,
      fetchedAt: new Date().toISOString(),
    }
    cache[asin] = entry
    sharedCache[asin] = entry
    cacheAmazonImageFromHtml(imageCache, asin, html, "fetch-keyboard-new-releases-specs")
    fetched++
    console.log(`  ok ${asin} ${(specs.title || "").slice(0, 50)}`)
    await new Promise((r) => setTimeout(r, 1600))
  }
  writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2))
  writeFileSync(SHARED_CACHE_PATH, JSON.stringify(sharedCache, null, 2))
  writeFileSync(IMAGE_CACHE_PATH, JSON.stringify(imageCache, null, 2))
  console.log(`Updated ${fetched} entries → ${CACHE_PATH}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
