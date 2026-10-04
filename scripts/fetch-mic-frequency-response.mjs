/**
 * Fetch mic frequency response from Amazon → mic-frequency-response-cache.json
 */
import { readFileSync, writeFileSync, existsSync, readdirSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import {
  getMicFrequencyForAsin,
  DASH,
} from "./amazon-mic-frequency-response.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, "..")
const CACHE_PATH = join(__dirname, "mic-frequency-response-cache.json")
const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/131.0.0.0 Safari/537.36",
  "Accept-Language": "ja-JP,ja;q=0.9,en;q=0.8",
}

function collectMicAsins() {
  const asins = new Set()
  for (const file of readdirSync(join(ROOT, "lib"))) {
    if (!file.endsWith(".ts")) continue
    const src = readFileSync(join(ROOT, "lib", file), "utf8")
    if (!src.includes('category: "mic"')) continue
    for (const m of src.matchAll(
      /purchaseUrl: "https:\/\/www\.amazon\.co\.jp\/dp\/([A-Z0-9]{10})"/g,
    )) {
      asins.add(m[1])
    }
  }
  return [...asins].sort()
}

async function fetchPage(asin, retries = 2) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(`https://www.amazon.co.jp/dp/${asin}`, { headers: HEADERS })
      if (!res.ok) {
        await new Promise((r) => setTimeout(r, 2500 * (i + 1)))
        continue
      }
      const html = await res.text()
      if (html.includes("productTitle") || html.includes("prodDetSectionEntry")) return html
    } catch {
      await new Promise((r) => setTimeout(r, 2500 * (i + 1)))
    }
  }
  return null
}

const cache = existsSync(CACHE_PATH)
  ? JSON.parse(readFileSync(CACHE_PATH, "utf8"))
  : {}
const asins = collectMicAsins()
const refresh = process.argv.includes("--refresh")
const onlyMissing = process.argv.includes("--missing")
const limitArg = process.argv.find((a) => a.startsWith("--limit="))
const limit = limitArg ? Number(limitArg.split("=")[1]) : Infinity

console.log(`Mic ASINs: ${asins.length}, cached: ${Object.keys(cache).length}`)

let fetched = 0
let failed = 0
let skipped = 0
let processed = 0

for (const asin of asins) {
  if (processed >= limit) break
  const existing = cache[asin]

  if (!refresh && existing?.fetchedAt && !existing?.error) {
    if (onlyMissing && existing.highlight !== DASH) {
      skipped++
      continue
    }
    if (!onlyMissing) {
      skipped++
      continue
    }
  }

  processed++
  const html = await fetchPage(asin)
  if (!html) {
    const override = getMicFrequencyForAsin(asin, null)
    cache[asin] = {
      ...override,
      error: "fetch_failed",
      fetchedAt: new Date().toISOString(),
    }
    failed++
    console.log(`FAIL ${asin}`)
  } else {
    const result = getMicFrequencyForAsin(asin, html)
    const title = html.match(/id="productTitle"[^>]*>([\s\S]*?)<\//)?.[1]?.replace(/<[^>]+>/g, "").trim().slice(0, 80)
    cache[asin] = {
      ...result,
      title,
      fetchedAt: new Date().toISOString(),
    }
    fetched++
    console.log(`${result.highlight === DASH ? "—" : "OK"} ${asin} ${result.highlight} (${result.source ?? "none"})`)
  }

  writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2))
  await new Promise((r) => setTimeout(r, 1200))
}

console.log(`Done. fetched=${fetched} failed=${failed} skipped=${skipped}`)
const filled = Object.values(cache).filter((v) => v.highlight && v.highlight !== DASH).length
const total = Object.keys(cache).length
console.log(`Cache: ${filled}/${total} with frequency response`)
