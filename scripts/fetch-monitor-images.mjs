/**
 * Fetch Amazon product images for monitor entries with placeholder image URLs.
 */
import { readFileSync, writeFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import {
  cacheAmazonImageFromHtml,
  isPlaceholderImage,
  normalizeAmazonImageUrl,
} from "./amazon-image.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, "..")
const FILES = [
  join(ROOT, "lib", "monitor-bestsellers.ts"),
  join(ROOT, "lib", "monitor-bestsellers-page2.ts"),
]
const CACHE_PATH = join(__dirname, "monitor-image-cache.json")
const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/131.0.0.0",
  "Accept-Language": "ja-JP,ja;q=0.9",
  Referer: "https://www.amazon.co.jp/",
}

function loadCache() {
  try {
    return JSON.parse(readFileSync(CACHE_PATH, "utf8"))
  } catch {
    return {}
  }
}

function collectPlaceholderAsins(filePath) {
  const src = readFileSync(filePath, "utf8")
  const asins = []
  const re =
    /image: "https:\/\/m\.media-amazon\.com\/images\/I\/61placeholder\._AC_SL1500_\.jpg"[\s\S]*?purchaseUrl: "https:\/\/www\.amazon\.co\.jp\/dp\/([A-Z0-9]{10})"/g
  let m
  while ((m = re.exec(src)) !== null) {
    asins.push(m[1])
  }
  return asins
}

function patchFile(filePath, imageByAsin) {
  let src = readFileSync(filePath, "utf8")
  let patched = 0
  for (const [asin, image] of Object.entries(imageByAsin)) {
    const marker = `purchaseUrl: "https://www.amazon.co.jp/dp/${asin}"`
    const idx = src.indexOf(marker)
    if (idx === -1) continue
    const start = Math.max(0, idx - 700)
    const end = Math.min(src.length, idx + 200)
    const chunk = src.slice(start, end)
    const placeholder =
      'image: "https://m.media-amazon.com/images/I/61placeholder._AC_SL1500_.jpg"'
    if (!chunk.includes(placeholder)) continue
    const newChunk = chunk.replace(placeholder, `image: "${image}"`)
    src = src.slice(0, start) + newChunk + src.slice(end)
    patched++
  }
  if (patched > 0) writeFileSync(filePath, src)
  return patched
}

const cache = loadCache()
const asins = [...new Set(FILES.flatMap(collectPlaceholderAsins))]
console.log(`Found ${asins.length} monitor ASINs with placeholder images`)

const imageByAsin = {}
let ok = 0
let fail = 0
let cached = 0

for (const asin of asins) {
  const existing = cache[asin]?.image
  if (existing && !isPlaceholderImage(existing)) {
    imageByAsin[asin] = normalizeAmazonImageUrl(existing)
    cached++
    continue
  }

  await new Promise((r) => setTimeout(r, 900))
  try {
    const res = await fetch(`https://www.amazon.co.jp/dp/${asin}`, { headers: HEADERS })
    if (!res.ok) {
      console.warn(`  ${asin}: HTTP ${res.status}`)
      fail++
      continue
    }
    const html = await res.text()
    const image = cacheAmazonImageFromHtml(cache, asin, html, "fetch-monitor-images")
    if (image) {
      imageByAsin[asin] = image
      ok++
      console.log(`  ${asin}: ${image}`)
    } else {
      console.warn(`  ${asin}: no image in HTML`)
      fail++
    }
  } catch (err) {
    console.warn(`  ${asin}: ${err.message}`)
    fail++
  }
}

writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2) + "\n")

let totalPatched = 0
for (const file of FILES) {
  totalPatched += patchFile(file, imageByAsin)
}

console.log(
  `Done: fetched=${ok} cached=${cached} fail=${fail} patched=${totalPatched} entries in TS files`,
)
