/**
 * リクライニング角度未設定の ASIN を Amazon から取得 → gaming-chair-recline-cache.json
 */
import { readFileSync, writeFileSync, existsSync, readdirSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { parseDetailTable } from "./amazon-monitor-body-specs.mjs"
import { inferMaxRecliningAngle, DASH } from "./amazon-gaming-chair-specs.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, "..")
const CACHE_PATH = join(__dirname, "gaming-chair-recline-cache.json")
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
      if (!/最大リクライニング角度", value: "—"/.test(m[1])) continue
      const asin = m[1].match(/purchaseUrl: "https:\/\/www\.amazon\.co\.jp\/dp\/([A-Z0-9]{10})/)?.[1]
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
const asins = collectDashAsins()
let fetched = 0
let filled = 0

for (let i = 0; i < asins.length; i++) {
  const asin = asins[i]
  const existing = cache[asin]
  if (existing?.maxRecliningAngle && existing.maxRecliningAngle !== DASH) continue

  process.stdout.write(`[${i + 1}/${asins.length}] ${asin} `)
  const html = await fetchPage(asin)
  if (!html) {
    cache[asin] = { error: "fetch_failed", fetchedAt: new Date().toISOString() }
    console.log("FAIL")
    await new Promise((r) => setTimeout(r, 800))
    continue
  }

  fetched++
  const title = extractTitle(html)
  const detailMap = parseDetailTable(html)
  const angle = inferMaxRecliningAngle(`${title} ${html.slice(0, 50000)}`, detailMap)
  cache[asin] = {
    title: title.slice(0, 200),
    maxRecliningAngle: angle,
    fetchedAt: new Date().toISOString(),
  }
  if (angle !== DASH) filled++
  console.log(angle)
  writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2))
  await new Promise((r) => setTimeout(r, 1200))
}

console.log({ total: asins.length, fetched, filled, cached: Object.keys(cache).length })
