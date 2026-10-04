/**
 * Reconstruct HTML from browser-extracted compact data and merge into spec cache.
 */
import { readFileSync, writeFileSync, existsSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { parseAmazonMouseSpecs } from "./amazon-mouse-specs.mjs"
import { toHighResImage } from "./amazon-image.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const CACHE_PATH = join(__dirname, "mouse-specs-cache.json")
const IMAGE_CACHE_PATH = join(__dirname, "mouse-image-cache.json")

function buildHtml(entry) {
  const rows = Object.entries(entry.map ?? {})
    .map(
      ([k, v]) =>
        `<th class="prodDetSectionEntry">${k}</th><td class="prodDetAttrValue">${v}</td>`,
    )
    .join("")
  return [
    `<div id="productTitle">${entry.title ?? ""}</div>`,
    `<div id="feature-bullets">${entry.bullets ?? ""}</div>`,
    `<div id="productDescription">${entry.desc ?? ""}</div>`,
    `<table id="prodDetails">${rows}</table>`,
  ].join("")
}

const batchFile = process.argv[2]
if (!batchFile) {
  console.error("Usage: node scripts/process-browser-extract-batch.mjs <extract.json>")
  process.exit(1)
}

const entries = JSON.parse(readFileSync(batchFile, "utf8"))
const cache = existsSync(CACHE_PATH)
  ? JSON.parse(readFileSync(CACHE_PATH, "utf8"))
  : {}
const imageCache = existsSync(IMAGE_CACHE_PATH)
  ? JSON.parse(readFileSync(IMAGE_CACHE_PATH, "utf8"))
  : {}

let ok = 0
for (const entry of entries) {
  if (!entry?.asin) continue
  const html = buildHtml(entry)
  const title = entry.title ?? ""
  const specs = parseAmazonMouseSpecs(html, title)
  cache[entry.asin] = {
    asin: entry.asin,
    title,
    specs,
    fetchedAt: new Date().toISOString(),
    source: "browser-extract",
  }
  const img = toHighResImage(entry.img)
  if (img) {
    imageCache[entry.asin] = {
      asin: entry.asin,
      image: img,
      fetchedAt: new Date().toISOString(),
      source: "browser-extract",
    }
  }
  ok++
}

writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2))
writeFileSync(IMAGE_CACHE_PATH, JSON.stringify(imageCache, null, 2))
console.log(`Processed ${ok} → cache ${Object.keys(cache).length}, images ${Object.keys(imageCache).length}`)
