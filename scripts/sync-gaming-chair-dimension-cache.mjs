/**
 * Merge saved HTML + browser-extracted JSON into dimension cache.
 * Usage: node scripts/sync-gaming-chair-dimension-cache.mjs [browser-results.json]
 */
import { readFileSync, writeFileSync, existsSync, readdirSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { GAMING_CHAIR_DIMENSIONS_KNOWN } from "./gaming-chair-dimensions-known.mjs"
import { parseGamingChairDimensionsFromHtml, mergeDimensionRecords } from "./gaming-chair-dimensions-parse.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const CACHE_PATH = join(__dirname, "gaming-chair-dimensions-cache.json")
const HTML_DIR = join(__dirname, "gaming-chair-html")
const FIELDS = ["dimensions", "seatDepth", "seatWidth", "backrestWidth"]

const cache = existsSync(CACHE_PATH) ? JSON.parse(readFileSync(CACHE_PATH, "utf8")) : {}

function applyDims(asin, dims, source) {
  const merged = mergeDimensionRecords(dims, GAMING_CHAIR_DIMENSIONS_KNOWN[asin])
  if (!FIELDS.some((f) => merged[f])) return false
  cache[asin] = { ...merged, source, fetchedAt: new Date().toISOString() }
  return true
}

let fromHtml = 0
if (existsSync(HTML_DIR)) {
  for (const file of readdirSync(HTML_DIR)) {
    if (!file.endsWith(".html")) continue
    const asin = file.replace(".html", "")
    const html = readFileSync(join(HTML_DIR, file), "utf8")
    if (applyDims(asin, parseGamingChairDimensionsFromHtml(html), "amazon")) fromHtml++
  }
}

const browserPath = process.argv[2]
let fromBrowser = 0
if (browserPath && existsSync(browserPath)) {
  const browser = JSON.parse(readFileSync(browserPath, "utf8"))
  for (const [asin, dims] of Object.entries(browser)) {
    if (applyDims(asin, dims, "browser")) fromBrowser++
  }
}

for (const [asin, dims] of Object.entries(GAMING_CHAIR_DIMENSIONS_KNOWN)) {
  applyDims(asin, dims, "known")
}

writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2) + "\n")
const stats = { has: 0, failed: 0 }
for (const v of Object.values(cache)) {
  if (FIELDS.some((f) => v[f])) stats.has++
  else if (v.source === "fetch-failed") stats.failed++
}
console.log(`sync: html=${fromHtml} browser=${fromBrowser} cache-with-dims=${stats.has} failed=${stats.failed}`)
