/**
 * Fetch Amazon mic card specs for unique ASINs → mic-card-specs-cache.json
 */
import { readFileSync, writeFileSync, existsSync, readdirSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { getMicCardSpecsForAsin } from "./amazon-mic-card-specs.mjs"
import { DASH } from "./mic-card-specs-known.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, "..")
const CACHE_PATH = join(__dirname, "mic-card-specs-cache.json")
const FIELDS = ["指向性", "周波数特性", "接続方式", "サンプルレート"]

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/131.0.0.0 Safari/537.36",
  "Accept-Language": "ja-JP,ja;q=0.9,en;q=0.8",
}

function parseMics(src) {
  const mics = []
  const re =
    /id: "([^"]+)"[\s\S]*?category: "mic"[\s\S]*?purchaseUrl: "https:\/\/www\.amazon\.co\.jp\/dp\/([A-Z0-9]{10})"[\s\S]*?highlights: \[([\s\S]*?)\]/g
  let m
  while ((m = re.exec(src))) {
    const hl = m[3]
    const missing = []
    for (const label of FIELDS) {
      const hm = hl.match(new RegExp(`label: "${label}", value: "([^"]*)"`))
      const val = hm?.[1] ?? "MISSING"
      if (val === DASH || val === "-" || val === "MISSING" || val === "") missing.push(label)
    }
    mics.push({ id: m[1], asin: m[2], missing })
  }
  return mics
}

const all = []
for (const file of readdirSync(join(ROOT, "lib"))) {
  if (!file.endsWith(".ts")) continue
  const src = readFileSync(join(ROOT, "lib", file), "utf8")
  if (!src.includes('category: "mic"')) continue
  for (const m of parseMics(src)) all.push(m)
}

const byAsin = new Map()
for (const m of all) byAsin.set(m.asin, m)

const cache = existsSync(CACHE_PATH) ? JSON.parse(readFileSync(CACHE_PATH, "utf8")) : {}
const limit = Number(process.argv[2] ?? 0) || Infinity

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

let fetched = 0
for (const [asin, item] of byAsin) {
  if (item.missing.length === 0) continue
  if (cache[asin]?.hasHtml && Object.keys(cache[asin].specs ?? {}).length >= item.missing.length) continue
  if (fetched >= limit) break

  const html = await fetchPage(asin)
  const specs = getMicCardSpecsForAsin(asin, html, item.missing)
  cache[asin] = {
    id: item.id,
    missing: item.missing,
    specs,
    fetchedAt: new Date().toISOString(),
    hasHtml: Boolean(html),
  }
  writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2))
  console.log(
    `${asin} ${Object.keys(specs).length}/${item.missing.length} ${html ? "amazon" : "known-only"}`,
  )
  fetched++
  await new Promise((r) => setTimeout(r, 700))
}

console.log(`Fetched ${fetched} ASINs. Cache size: ${Object.keys(cache).length}`)
