/**
 * Reconcile product images: fetch missing → update cache → regenerate mouse TS files.
 */
import { readFileSync, writeFileSync, existsSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { spawnSync } from "child_process"
import {
  cacheAmazonImageFromHtml,
  collectGadgetAsinImages,
  isValidAmazonProductImage,
  needsImageFetch,
  resolveGadgetImage,
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

const skipFetch = process.argv.includes("--no-fetch")
const refresh = process.argv.includes("--refresh")

const cache = existsSync(CACHE_PATH)
  ? JSON.parse(readFileSync(CACHE_PATH, "utf8"))
  : {}
const overrides = existsSync(OVERRIDES_PATH)
  ? JSON.parse(readFileSync(OVERRIDES_PATH, "utf8"))
  : {}

const asins = collectGadgetAsinImages(ROOT)
const targets = [...asins.entries()].filter(([asin, image]) =>
  refresh ? true : needsImageFetch(asin, image, cache, overrides),
)

console.log(`Image reconcile: ${targets.length} ASINs need fetch / ${asins.size} total`)

let fetched = 0
let failed = 0

if (!skipFetch) {
  for (const [asin] of targets) {
    if (!refresh && !needsImageFetch(asin, asins.get(asin) ?? "", cache, overrides)) {
      continue
    }
    await new Promise((r) => setTimeout(r, 900))
    try {
      const res = await fetch(`https://www.amazon.co.jp/dp/${asin}`, { headers: HEADERS })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const html = await res.text()
      if (!html.includes("productTitle") && html.length < 5000) {
        throw new Error("blocked or empty page")
      }
      const image = cacheAmazonImageFromHtml(cache, asin, html, "reconcile")
      if (!image) throw new Error("no image in page")
      console.log(`OK  ${asin} → ${image}`)
      fetched++
      if (fetched % 20 === 0) {
        writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2) + "\n")
      }
    } catch (e) {
      console.warn(`FAIL ${asin}: ${e.message}`)
      failed++
    }
  }
  writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2) + "\n")
  console.log(`Fetch done: ok=${fetched}, fail=${failed}, cache=${Object.keys(cache).length}`)
}

console.log("\nRegenerating mouse-bestsellers.ts + mouse-popular-brands.ts...")
for (const script of ["merge-bestsellers.mjs", "merge-popular-brands.mjs"]) {
  const r = spawnSync(process.execPath, [join(__dirname, script)], {
    cwd: ROOT,
    stdio: "inherit",
  })
  if (r.status !== 0) process.exit(r.status ?? 1)
}

let valid = 0
let missing = 0
const missingList = []
for (const [asin, image] of asins) {
  const resolved = resolveGadgetImage(asin, image, cache, overrides)
  if (isValidAmazonProductImage(resolved)) valid++
  else {
    missing++
    missingList.push(asin)
  }
}

console.log(`\nAudit: valid images ${valid}/${asins.size}, missing ${missing}`)
if (missingList.length) {
  console.log("Still missing:", missingList.slice(0, 30).join(", "))
  if (missingList.length > 30) console.log(`  ... +${missingList.length - 30} more`)
}
