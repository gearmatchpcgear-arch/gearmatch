/**
 * Fetch mic card specs for ASINs needing fixes → mic-card-specs-cache.json
 */
import { readFileSync, writeFileSync, existsSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { getMicCardSpecsForAsin } from "./amazon-mic-card-specs.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const CACHE_PATH = join(__dirname, "mic-card-specs-cache.json")
const TO_FIX_PATH = join(__dirname, "mic-card-specs-to-fix.json")
const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/131.0.0.0 Safari/537.36",
  "Accept-Language": "ja-JP,ja;q=0.9,en;q=0.8",
}

const toFix = JSON.parse(readFileSync(TO_FIX_PATH, "utf8"))
const cache = existsSync(CACHE_PATH) ? JSON.parse(readFileSync(CACHE_PATH, "utf8")) : {}

async function fetchPage(asin) {
  try {
    const res = await fetch(`https://www.amazon.co.jp/dp/${asin}`, { headers: HEADERS })
    if (!res.ok) return null
    const html = await res.text()
    if (html.includes("productTitle") || html.includes("prodDetSectionEntry")) return html
  } catch {
    return null
  }
  return null
}

for (const item of toFix) {
  const { asin, shouldFix } = item
  if (cache[asin]?.applied) continue

  const html = await fetchPage(asin)
  const specs = getMicCardSpecsForAsin(asin, html, shouldFix)
  cache[asin] = {
    id: item.id,
    shouldFix,
    specs,
    fetchedAt: new Date().toISOString(),
    hasHtml: Boolean(html),
  }
  writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2))
  const filled = Object.keys(specs).length
  console.log(`${asin} ${filled}/${shouldFix.length} fields ${html ? "amazon" : "known-only"}`)
  await new Promise((r) => setTimeout(r, 800))
}

console.log("Done")
