/**
 * Fetch Amazon gaming chair dimensions → gaming-chair-dimensions-cache.json
 */
import { readFileSync, writeFileSync, existsSync, readdirSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { GAMING_CHAIR_DIMENSIONS_KNOWN } from "./gaming-chair-dimensions-known.mjs"
import { parseGamingChairDimensionsFromHtml, mergeDimensionRecords } from "./gaming-chair-dimensions-parse.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, "..")
const CACHE_PATH = join(__dirname, "gaming-chair-dimensions-cache.json")

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  "Accept-Language": "ja-JP,ja;q=0.9",
}

function collectAsins() {
  const asins = new Set()
  for (const f of readdirSync(join(ROOT, "lib"))) {
    if (!f.startsWith("gaming-chair") || !f.endsWith(".ts")) continue
    const t = readFileSync(join(ROOT, "lib", f), "utf8")
    for (const m of t.matchAll(/purchaseUrl: "https:\/\/www\.amazon\.co\.jp\/dp\/([A-Z0-9]{10})"/g)) {
      asins.add(m[1])
    }
  }
  return [...asins].sort()
}

async function fetchPage(asin) {
  for (let i = 0; i < 3; i++) {
    try {
      const res = await fetch(`https://www.amazon.co.jp/dp/${asin}`, { headers: HEADERS })
      if (!res.ok) {
        await new Promise((r) => setTimeout(r, 1200 * (i + 1)))
        continue
      }
      const html = await res.text()
      if (html.includes("prodDetSectionEntry") || html.includes("productTitle")) return html
    } catch {
      await new Promise((r) => setTimeout(r, 1200 * (i + 1)))
    }
  }
  return null
}

const cache = existsSync(CACHE_PATH) ? JSON.parse(readFileSync(CACHE_PATH, "utf8")) : {}
const FIELDS = ["dimensions", "seatDepth", "seatWidth", "backrestWidth"]
const asins = collectAsins()
let fetched = 0
let parsed = 0

for (let i = 0; i < asins.length; i++) {
  const asin = asins[i]
  if (GAMING_CHAIR_DIMENSIONS_KNOWN[asin]) {
    cache[asin] = {
      ...GAMING_CHAIR_DIMENSIONS_KNOWN[asin],
      source: "known",
      fetchedAt: new Date().toISOString(),
    }
    continue
  }

  const existing = cache[asin]
  if (existing && FIELDS.some((f) => existing[f])) continue

  process.stdout.write(`[${i + 1}/${asins.length}] ${asin} ... `)
  const html = await fetchPage(asin)
  await new Promise((r) => setTimeout(r, 800))

  if (!html) {
    console.log("skip")
    cache[asin] = { source: "fetch-failed", fetchedAt: new Date().toISOString() }
    fetched++
    continue
  }

  const dims = mergeDimensionRecords(parseGamingChairDimensionsFromHtml(html))
  const hasAny = Object.keys(dims).length > 0
  cache[asin] = { ...dims, source: hasAny ? "amazon" : "empty", fetchedAt: new Date().toISOString() }
  console.log(hasAny ? Object.keys(dims).join(", ") : "empty")
  if (hasAny) parsed++
  fetched++
}

writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2) + "\n")
console.log(`Done. cache=${Object.keys(cache).length} newly-fetched=${fetched} with-dims=${parsed}`)
