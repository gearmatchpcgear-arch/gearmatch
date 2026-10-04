/**
 * フレーム素材未設定の ASIN を Amazon から取得 → gaming-chair-frame-cache.json
 */
import { readFileSync, writeFileSync, existsSync, readdirSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { parseDetailTable } from "./amazon-monitor-body-specs.mjs"
import { inferFrameMaterial, DASH, extractAmazonChairSpecHaystack } from "./amazon-gaming-chair-specs.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, "..")
const CACHE_PATH = join(__dirname, "gaming-chair-frame-cache.json")
const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  "Accept-Language": "ja-JP,ja;q=0.9",
}

function collectDashAsins() {
  const asins = new Set()
  for (const f of readdirSync(join(ROOT, "lib"))) {
    if (!f.startsWith("gaming-chair") || !f.endsWith(".ts")) continue
    const src = readFileSync(join(ROOT, "lib", f), "utf8")
    const blockRe = /(\{\s*\n\s*id: "chair-[^"]+"[\s\S]*?\n  \},)/g
    let m
    while ((m = blockRe.exec(src))) {
      const block = m[1]
      const hasFrameProp = /frameMaterial: "([^"]+)"/.exec(block)
      const highlightFrame = block.match(/\{ label: "フレームの種類", value: "([^"]+)" \}/)
      const val = hasFrameProp?.[1] || highlightFrame?.[1]
      const isMissing = !val || val === "—" || val === "-" || val === "フレーム: —"
      if (!isMissing) continue
      const asin = block.match(/purchaseUrl: "https:\/\/www\.amazon\.co\.jp\/dp\/([A-Z0-9]{10})/)?.[1]
      if (asin) asins.add(asin)
    }
  }
  return [...asins].sort()
}

async function fetchPage(asin) {
  for (let i = 0; i < 2; i++) {
    try {
      const res = await fetch(`https://www.amazon.co.jp/dp/${asin}`, { headers: HEADERS })
      if (!res.ok) {
        await new Promise((r) => setTimeout(r, 1500 * (i + 1)))
        continue
      }
      const html = await res.text()
      if (html.includes("productTitle") || html.includes("prodDetSectionEntry")) return html
    } catch {
      await new Promise((r) => setTimeout(r, 1500 * (i + 1)))
    }
  }
  return null
}

function extractTitle(html) {
  return (
    html.match(/id="productTitle"[^>]*>\s*([\s\S]*?)<\/span>/i)?.[1]?.replace(/<[^>]+>/g, " ").trim() ??
    ""
  )
}

const cache = existsSync(CACHE_PATH) ? JSON.parse(readFileSync(CACHE_PATH, "utf8")) : {}
const asins = collectDashAsins().filter((a) => !cache[a]?.frameMaterial || cache[a].frameMaterial === DASH)

console.log(`Fetching frame material for ${asins.length} ASINs...`)

let fetched = 0
let resolved = 0

for (const asin of asins) {
  const html = await fetchPage(asin)
  if (!html) {
    cache[asin] = { frameMaterial: DASH, fetchedAt: new Date().toISOString(), error: "fetch_failed" }
    writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2))
    await new Promise((r) => setTimeout(r, 1200))
    continue
  }

  fetched++
  const haystack = extractAmazonChairSpecHaystack(html)
  const detailMap = parseDetailTable(html)
  const frameMaterial = inferFrameMaterial(haystack, detailMap)
  cache[asin] = {
    haystack: haystack.slice(0, 200),
    frameMaterial,
    fetchedAt: new Date().toISOString(),
  }
  if (frameMaterial !== DASH) resolved++
  writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2))
  console.log(`${asin}: ${frameMaterial} (${fetched}/${asins.length})`)
  await new Promise((r) => setTimeout(r, 1200))
}

console.log(`Done. Fetched ${fetched}, resolved ${resolved}`)
