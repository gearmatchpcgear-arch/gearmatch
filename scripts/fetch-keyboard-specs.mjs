/**
 * Fetch Amazon JP keyboard product specs → keyboard-specs-cache.json
 */
import { readFileSync, writeFileSync, existsSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { parseAmazonKeyboardSpecs } from "./amazon-keyboard-specs.mjs"
import { parseAmazonPrice } from "./amazon-price.mjs"
import { cacheAmazonImageFromHtml } from "./amazon-image.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, "..")
const CACHE_PATH = join(__dirname, "keyboard-specs-cache.json")
const IMAGE_CACHE_PATH = join(__dirname, "keyboard-image-cache.json")
const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/131.0.0.0 Safari/537.36",
  "Accept-Language": "ja-JP,ja;q=0.9",
}

function collectAsins() {
  const asins = new Map()
  const files = [
    join(ROOT, "lib", "keyboard-bestsellers.ts"),
    join(ROOT, "lib", "keyboard-gaming-bestsellers.ts"),
    join(ROOT, "lib", "gadgets.ts"),
  ]
  for (const rawName of [
    "keyboard-bestsellers-raw.json",
    "keyboard-bestsellers-page2-raw.json",
    "gaming-keyboard-bestsellers-raw.json",
    "gaming-keyboard-bestsellers-page2-raw.json",
    "gaming-keyboard-most-gifted-raw.json",
    "gaming-keyboard-most-gifted-page2-raw.json",
    "gaming-keyboard-new-releases-page1-raw.json",
    "gaming-keyboard-new-releases-page2-raw.json",
  ]) {
    const rawPath = join(__dirname, rawName)
    if (existsSync(rawPath)) {
      const { keyboards } = JSON.parse(readFileSync(rawPath, "utf8"))
      for (const k of keyboards) asins.set(k.asin, true)
    }
  }
  for (const file of files) {
    if (!existsSync(file)) continue
    const src = readFileSync(file, "utf8")
    const re = /purchaseUrl: "https:\/\/www\.amazon\.co\.jp\/dp\/([A-Z0-9]{10})"/g
    let m
    while ((m = re.exec(src)) !== null) {
      if (file.endsWith("gadgets.ts")) {
        const ctx = src.slice(Math.max(0, m.index - 200), m.index)
        if (!/category: "keyboard"/.test(ctx)) continue
      }
      asins.set(m[1], true)
    }
  }
  return [...asins.keys()]
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
      if (html.includes("prodDetSectionEntry") || html.includes("productTitle"))
        return html
    } catch {
      await new Promise((r) => setTimeout(r, 2000 * (i + 1)))
    }
  }
  return null
}

const cache = existsSync(CACHE_PATH)
  ? JSON.parse(readFileSync(CACHE_PATH, "utf8"))
  : {}
const imageCache = existsSync(IMAGE_CACHE_PATH)
  ? JSON.parse(readFileSync(IMAGE_CACHE_PATH, "utf8"))
  : {}
const asins = collectAsins()
console.log(`Keyboard ASINs: ${asins.length}, cached: ${Object.keys(cache).length}`)

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
  const specs = parseAmazonKeyboardSpecs(html)
  const price = parseAmazonPrice(html)
  cache[asin] = { specs, price, title: specs.title, fetchedAt: new Date().toISOString() }
  cacheAmazonImageFromHtml(imageCache, asin, html, "fetch-keyboard-specs")
  fetched++
}

writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2))
writeFileSync(IMAGE_CACHE_PATH, JSON.stringify(imageCache, null, 2))
console.log(`Done. fetched=${fetched} failed=${failed} total=${Object.keys(cache).length}`)
