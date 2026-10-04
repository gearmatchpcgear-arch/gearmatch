/**
 * Fetch Amazon product images for gadgets with empty/invalid image fields and patch lib/*.ts.
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import {
  cacheAmazonImageFromHtml,
  isPlaceholderImage,
  isValidAmazonProductImage,
  normalizeAmazonImageUrl,
} from "./amazon-image.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, "..")
const LIB = join(ROOT, "lib")
const CACHE_PATH = join(__dirname, "global-image-cache.json")

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0.0.0 Safari/537.36",
  "Accept-Language": "ja-JP,ja;q=0.9",
  Referer: "https://www.amazon.co.jp/",
}

const SKIP_FILES = new Set([
  "gadgets.ts",
  "gadget-filters.ts",
  "gadget-images.ts",
  "price-filter.ts",
  "spec-display-sanitize.ts",
  "mic-connection-display.ts",
  "monitor-detail-specs.ts",
  "monitor-vesa-standard.ts",
  "gaming-chair-dimensions.ts",
])

const skipFetch = process.argv.includes("--no-fetch")
const dryRun = process.argv.includes("--dry-run")

function loadCache() {
  if (!existsSync(CACHE_PATH)) return {}
  return JSON.parse(readFileSync(CACHE_PATH, "utf8"))
}

function saveCache(cache) {
  writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2) + "\n")
}

function listGadgetFiles() {
  return readdirSync(LIB).filter(
    (f) =>
      f.endsWith(".ts") &&
      !SKIP_FILES.has(f) &&
      !f.includes("-filter-tags") &&
      !f.endsWith("-tags.ts") &&
      !f.includes("-use-tags") &&
      !f.includes("-feature-tags"),
  )
}

/** file → [{ asin, image, name }] */
function collectMissingByFile() {
  const result = new Map()

  for (const file of listGadgetFiles()) {
    const path = join(LIB, file)
    const src = readFileSync(path, "utf8")
    if (!src.includes("purchaseUrl:")) continue

    const entries = []
    const re =
      /name: "([^"]*)"[\s\S]*?image: "([^"]*)"[\s\S]*?purchaseUrl: "https:\/\/www\.amazon\.co\.jp\/dp\/([A-Z0-9]{10})"/g
    let m
    while ((m = re.exec(src)) !== null) {
      const [, name, image, asin] = m
      if (!isValidAmazonProductImage(image)) {
        entries.push({ asin, image, name })
      }
    }

    if (entries.length > 0) result.set(file, entries)
  }

  return result
}

function patchFile(file, imageByAsin) {
  const path = join(LIB, file)
  let src = readFileSync(path, "utf8")
  let patched = 0

  for (const [asin, image] of Object.entries(imageByAsin)) {
    const marker = `purchaseUrl: "https://www.amazon.co.jp/dp/${asin}"`
    let searchFrom = 0

    while (true) {
      const idx = src.indexOf(marker, searchFrom)
      if (idx === -1) break

      const start = Math.max(0, idx - 900)
      const chunk = src.slice(start, idx)
      const replaced = chunk.replace(/image: "",/, `image: "${image}",`)
      if (replaced !== chunk) {
        src = src.slice(0, start) + replaced + src.slice(idx)
        patched++
        searchFrom = start + replaced.length + marker.length
      } else {
        searchFrom = idx + marker.length
      }
    }
  }

  if (patched > 0 && !dryRun) writeFileSync(path, src)
  return patched
}

async function fetchImage(cache, asin) {
  const cached = cache[asin]?.image
  if (isValidAmazonProductImage(cached)) {
    return normalizeAmazonImageUrl(cached)
  }

  await new Promise((r) => setTimeout(r, 850))
  const res = await fetch(`https://www.amazon.co.jp/dp/${asin}`, { headers: HEADERS })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const html = await res.text()
  if (!html.includes("productTitle") && html.length < 5000) {
    throw new Error("blocked or empty page")
  }
  const image = cacheAmazonImageFromHtml(cache, asin, html, "backfill-missing-images")
  if (!image) throw new Error("no image in HTML")
  return normalizeAmazonImageUrl(image)
}

const cache = loadCache()
const missingByFile = collectMissingByFile()

const uniqueAsins = new Map()
for (const [, entries] of missingByFile) {
  for (const { asin, name } of entries) {
    if (!uniqueAsins.has(asin)) uniqueAsins.set(asin, name)
  }
}

console.log(`Files with missing images: ${missingByFile.size}`)
console.log(`Unique ASINs to resolve: ${uniqueAsins.size}`)
for (const [file, entries] of missingByFile) {
  console.log(`  ${file}: ${entries.length}`)
}

const imageByAsin = {}
let ok = 0
let fail = 0

for (const [asin, name] of uniqueAsins) {
  if (skipFetch) {
    const cached = cache[asin]?.image
    if (isValidAmazonProductImage(cached)) {
      imageByAsin[asin] = normalizeAmazonImageUrl(cached)
      ok++
    } else {
      fail++
      console.warn(`SKIP (no-fetch) ${asin} ${name}`)
    }
    continue
  }

  try {
    const image = await fetchImage(cache, asin)
    imageByAsin[asin] = image
    ok++
    console.log(`OK  ${asin} | ${name.slice(0, 50)} → ${image}`)
  } catch (e) {
    fail++
    console.warn(`FAIL ${asin} | ${name.slice(0, 50)}: ${e.message}`)
  }

  if (ok > 0 && ok % 15 === 0) saveCache(cache)
}

if (!skipFetch) saveCache(cache)

let totalPatched = 0
for (const [file] of missingByFile) {
  const patched = patchFile(file, imageByAsin)
  if (patched > 0) console.log(`Patched ${patched} in ${file}`)
  totalPatched += patched
}

console.log(`\nDone: resolved=${ok}, failed=${fail}, patched=${totalPatched}`)
if (dryRun) console.log("(dry-run: no files written)")
