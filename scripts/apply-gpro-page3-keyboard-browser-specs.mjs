/**
 * Merge browser-fetched gpro page3 keyboard pages into keyboard-specs-cache.json
 */
import { readFileSync, writeFileSync, existsSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { parseAmazonKeyboardSpecs } from "./amazon-keyboard-specs.mjs"
import { normalizeAmazonImageUrl } from "./amazon-image.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const CDP_PATH =
  process.argv[2] ?? join(__dirname, "keyboard-gpro-page3-cdp-specs.json")
const CACHE_PATH = join(__dirname, "keyboard-specs-cache.json")
const IMAGE_CACHE_PATH = join(__dirname, "keyboard-image-cache.json")
const OVERRIDES_PATH = join(__dirname, "keyboard-gpro-page3-spec-overrides.json")

function flatToHtml(flat, title) {
  const rows = Object.entries(flat)
    .filter(([k]) => !/Customer Reviews|Amazon Bestseller|ASIN/i.test(k))
    .map(([k, v]) => `<tr><th class="prodDetSectionEntry">${k}</th><td class="prodDetAttrValue">${v}</td></tr>`)
  return `<div id="productTitle">${title}</div><table>${rows.join("")}</table>`
}

if (!existsSync(CDP_PATH)) {
  console.error(`Missing ${CDP_PATH}`)
  process.exit(1)
}

const cdp = JSON.parse(readFileSync(CDP_PATH, "utf8"))
const data = cdp.result?.value ?? cdp
const overrides = existsSync(OVERRIDES_PATH)
  ? JSON.parse(readFileSync(OVERRIDES_PATH, "utf8"))
  : {}
const cache = existsSync(CACHE_PATH) ? JSON.parse(readFileSync(CACHE_PATH, "utf8")) : {}
const imageCache = existsSync(IMAGE_CACHE_PATH)
  ? JSON.parse(readFileSync(IMAGE_CACHE_PATH, "utf8"))
  : {}

let updated = 0
for (const [asin, entry] of Object.entries(data)) {
  if (entry.error || !entry.title) continue
  const flat = entry.specs ?? {}
  const html = flatToHtml(flat, entry.title)
  const parsed = parseAmazonKeyboardSpecs(html)
  const o = overrides[asin] ?? {}

  if (o.layout) parsed.layout = o.layout
  if (o.internalStructure) parsed.switchType = o.internalStructure
  if (o.weight) parsed.weight = o.weight

  cache[asin] = {
    asin,
    title: entry.title,
    specs: parsed,
    price: entry.price ?? cache[asin]?.price ?? null,
    fetchedAt: new Date().toISOString(),
  }

  if (entry.image) {
    imageCache[asin] = {
      url: normalizeAmazonImageUrl(entry.image),
      source: "apply-gpro-page3-keyboard-browser-specs",
    }
  }
  updated++
}

writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2) + "\n")
writeFileSync(IMAGE_CACHE_PATH, JSON.stringify(imageCache, null, 2) + "\n")
console.log(`Updated keyboard-specs-cache: ${updated} ASINs`)
