/**
 * Re-fetch Amazon pages missing dimensions and update cache.
 * Saves HTML under scripts/gaming-chair-html/ for reparsing without refetch.
 */
import { readFileSync, writeFileSync, existsSync, readdirSync, mkdirSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { GAMING_CHAIR_DIMENSIONS_KNOWN } from "./gaming-chair-dimensions-known.mjs"
import { parseGamingChairDimensionsFromHtml, mergeDimensionRecords } from "./gaming-chair-dimensions-parse.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, "..")
const CACHE_PATH = join(__dirname, "gaming-chair-dimensions-cache.json")
const HTML_DIR = join(__dirname, "gaming-chair-html")
mkdirSync(HTML_DIR, { recursive: true })

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  "Accept-Language": "ja-JP,ja;q=0.9",
}

const FIELDS = ["dimensions", "seatDepth", "seatWidth", "backrestWidth"]

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

function hasDims(entry) {
  return entry && FIELDS.some((f) => entry[f])
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

function loadHtml(asin) {
  const path = join(HTML_DIR, `${asin}.html`)
  return existsSync(path) ? readFileSync(path, "utf8") : null
}

function saveHtml(asin, html) {
  writeFileSync(join(HTML_DIR, `${asin}.html`), html)
}

const cache = existsSync(CACHE_PATH) ? JSON.parse(readFileSync(CACHE_PATH, "utf8")) : {}
const asins = collectAsins()
let parsed = 0
let fetched = 0
let reparsed = 0

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

  if (hasDims(cache[asin])) continue

  let html = loadHtml(asin)
  if (!html) {
    process.stdout.write(`[${i + 1}/${asins.length}] fetch ${asin} ... `)
    html = await fetchPage(asin)
    await new Promise((r) => setTimeout(r, 900))
    if (!html) {
      console.log("skip")
      cache[asin] = { source: "fetch-failed", fetchedAt: new Date().toISOString() }
      fetched++
      continue
    }
    saveHtml(asin, html)
    console.log("saved")
    fetched++
  } else {
    reparsed++
  }

  const dims = mergeDimensionRecords(parseGamingChairDimensionsFromHtml(html))
  if (Object.keys(dims).length > 0) {
    cache[asin] = { ...dims, source: "amazon", fetchedAt: new Date().toISOString() }
    parsed++
    process.stdout.write(`  ${asin}: ${Object.keys(dims).join(", ")}\n`)
  } else if (!cache[asin]?.source) {
    cache[asin] = { source: "empty", fetchedAt: new Date().toISOString() }
  }
}

writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2) + "\n")
console.log(`Done. parsed=${parsed} fetched=${fetched} reparsed-local=${reparsed}`)
