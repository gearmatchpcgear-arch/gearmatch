/**
 * Flag gadgets whose brand/name likely mismatches Amazon product title.
 * Uses Node fetch; caches results to asin-title-cache.json
 */
import { readFileSync, writeFileSync, existsSync, readdirSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, "..")
const CACHE_PATH = join(__dirname, "asin-title-cache.json")
const cache = existsSync(CACHE_PATH) ? JSON.parse(readFileSync(CACHE_PATH, "utf8")) : {}
const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/131.0.0.0",
  "Accept-Language": "ja-JP,ja;q=0.9",
}

function extractGadgets(src, file) {
  const gadgets = []
  const blockRe =
    /\{\s*\n\s*id: "([^"]+)"[\s\S]*?name: "([^"]*)"[\s\S]*?brand: "([^"]*)"[\s\S]*?purchaseUrl: "https:\/\/www\.amazon\.co\.jp\/dp\/([A-Z0-9]{10})"/g
  let m
  while ((m = blockRe.exec(src)) !== null) {
    gadgets.push({ id: m[1], name: m[2], brand: m[3], asin: m[4], file })
  }
  return gadgets
}

const all = []
for (const file of readdirSync(join(ROOT, "lib"))) {
  if (!file.endsWith(".ts")) continue
  all.push(...extractGadgets(readFileSync(join(ROOT, "lib", file), "utf8"), file))
}

const byAsin = new Map()
for (const g of all) {
  if (!byAsin.has(g.asin)) byAsin.set(g.asin, [])
  byAsin.get(g.asin).push(g)
}

function brandTokens(brand) {
  if (!brand || brand === "—") return []
  return brand
    .replace(/IO DATA|IODATA/i, "iodata")
    .split(/[\s/]+/)
    .map((t) => t.toLowerCase())
    .filter((t) => t.length > 2)
}

function likelyMatch(gadget, title) {
  const hay = title.toLowerCase()
  const tokens = brandTokens(gadget.brand)
  if (tokens.length === 0) return true
  if (tokens.some((t) => hay.includes(t))) return true
  // common aliases
  if (/logicool|logitech/i.test(gadget.brand) && /logitech|logicool|ロジクール/i.test(title))
    return true
  if (/asus/i.test(gadget.brand) && /asus|エイスース/i.test(title)) return true
  if (/cocopar/i.test(gadget.brand) && /cocopar/i.test(title)) return true
  if (/pixio|ピクシオ/i.test(gadget.brand) && /pixio|ピクシオ/i.test(title)) return true
  return false
}

async function fetchTitle(asin) {
  if (cache[asin]?.title && !process.argv.includes("--refresh")) return cache[asin]
  await new Promise((r) => setTimeout(r, 1100))
  const html = await fetch(`https://www.amazon.co.jp/dp/${asin}`, { headers: HEADERS }).then((r) =>
    r.text(),
  )
  const title =
    html
      .match(/id="productTitle"[^>]*>([\s\S]*?)<\//)?.[1]
      ?.replace(/<[^>]+>/g, "")
      .trim() ?? ""
  const image =
    html.match(/"hiRes":"(https:[^"]+)"/)?.[1] ||
    html.match(/"large":"(https:[^"]+)"/)?.[1] ||
    ""
  cache[asin] = { asin, title, image, fetchedAt: new Date().toISOString() }
  return cache[asin]
}

const only = process.argv.find((a) => a.startsWith("--asin="))?.slice(7)
const asins = only ? [only] : [...byAsin.keys()]

const mismatches = []
for (const asin of asins) {
  if (!only && byAsin.get(asin).every((g) => g.file.startsWith("mouse"))) continue
  let meta
  try {
    meta = await fetchTitle(asin)
  } catch {
    continue
  }
  if (!meta.title) continue
  for (const g of byAsin.get(asin)) {
    if (!likelyMatch(g, meta.title)) {
      mismatches.push({ ...g, amazonTitle: meta.title.slice(0, 100), image: meta.image })
    }
  }
  if (Object.keys(cache).length % 25 === 0) {
    writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2) + "\n")
  }
}

writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2) + "\n")

console.log(`Checked ${asins.length} ASINs, mismatches: ${mismatches.length}`)
for (const m of mismatches) {
  console.log(`\n${m.asin} ${m.id} [${m.brand}] ${m.name}`)
  console.log(`  Amazon: ${m.amazonTitle}`)
  console.log(`  File: ${m.file}`)
}
