/**
 * monitor-asus-search-raw.json + 商品ページ → monitor-asus-search-enriched.json
 */
import { readFileSync, writeFileSync, existsSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import {
  extractAmazonMainImage,
  cacheAmazonImageFromHtml,
  normalizeAmazonImageUrl,
} from "./amazon-image.mjs"
import { normalizeImportedPrice, parseAmazonPrice } from "./amazon-price.mjs"
import { parseAmazonMonitorBodySpecs } from "./amazon-monitor-body-specs.mjs"
import { DASH } from "./amazon-monitor-specs.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const RAW_PATH = join(__dirname, "monitor-asus-search-raw.json")
const CACHE_PATH = join(__dirname, "monitor-image-cache.json")
const OVERRIDES_PATH = join(__dirname, "monitor-asus-search-spec-overrides.json")
const OUT_PATH = join(__dirname, "monitor-asus-search-enriched.json")

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  "Accept-Language": "ja-JP,ja;q=0.9",
}

const imageCache = existsSync(CACHE_PATH)
  ? JSON.parse(readFileSync(CACHE_PATH, "utf8"))
  : {}
const overrides = existsSync(OVERRIDES_PATH)
  ? JSON.parse(readFileSync(OVERRIDES_PATH, "utf8"))
  : {}

async function fetchPage(asin, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      await new Promise((r) => setTimeout(r, 1200 * (i + 1)))
      const res = await fetch(`https://www.amazon.co.jp/dp/${asin}`, { headers: HEADERS })
      if (!res.ok) continue
      const html = await res.text()
      if (html.includes("productTitle") || html.includes("prodDetSectionEntry")) return html
    } catch {
      /* retry */
    }
  }
  return null
}

function parseSpecTable(html) {
  const specs = {}
  const rowRe =
    /<tr[^>]*>\s*<th[^>]*>([\s\S]*?)<\/th>\s*<td[^>]*>([\s\S]*?)<\/td>\s*<\/tr>/gi
  let m
  while ((m = rowRe.exec(html)) !== null) {
    const key = m[1].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim()
    const val = m[2].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim()
    if (key && val) specs[key] = val
  }
  return specs
}

function inferFromSpecs(specs, title) {
  const hay = Object.entries(specs)
    .map(([k, v]) => `${k} ${v}`)
    .join(" ")
  const combined = `${title} ${hay}`
  const out = {}

  const inch =
    combined.match(/([\d.]+)\s*(?:インチ|型|inch)/i)?.[1] ??
    specs["画面サイズ"]?.match(/([\d.]+)/)?.[1]
  if (inch) out.screenSize = `${inch} インチ`

  const res =
    specs["解像度"] ??
    specs["最大解像度"] ??
    (/\b3840\s*[x×*]\s*2160|4K/i.test(combined)
      ? "3840 x 2160 (4K UHD)"
      : /\b2560\s*[x×*]\s*1440|WQHD/i.test(combined)
        ? "2560 x 1440 (QHD)"
        : /\b1920\s*[x×*]\s*1080|FHD|フルHD/i.test(combined)
          ? "1920 x 1080 (FHD)"
          : null)
  if (res) out.resolution = res.includes("(") ? res : res

  const refresh =
    specs["リフレッシュレート"] ??
    combined.match(/(\d{2,3})\s*Hz/i)?.[0]
  if (refresh) out.refreshRate = refresh.replace(/\s+/g, " ")

  const panel = specs["パネル"] ?? specs["ディスプレイタイプ"] ?? specs["パネルタイプ"]
  if (panel) out.panel = panel

  const ports = specs["インターフェース"] ?? specs["接続端子"] ?? specs["入力端子"]
  if (ports) out.connection = ports.replace(/[,、]/g, " / ")

  const weight = specs["商品重量"] ?? specs["重量"]
  if (weight) {
    const g = weight.match(/([\d,.]+)\s*(?:g|グラム|kg|キロ)/i)
    if (g) {
      const num = Number(g[1].replace(/,/g, ""))
      out.weight = /kg|キロ/i.test(weight) ? `${Math.round(num * 1000)} g` : `${num} g`
    }
  }

  return out
}

async function main() {
  const { monitors } = JSON.parse(readFileSync(RAW_PATH, "utf8"))
  const enriched = []

  for (const item of monitors) {
    const override = overrides[item.asin] ?? {}
    let next = { ...item, ...override }

    const html = await fetchPage(item.asin)
    if (html) {
      const liveTitle = html.match(/id="productTitle"[^>]*>\s*([\s\S]*?)<\/span>/)?.[1]
      if (liveTitle) next.title = liveTitle.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim()

      const livePrice = parseAmazonPrice(html)
      if (livePrice != null) next.price = normalizeImportedPrice(livePrice)

      const mainImg = extractAmazonMainImage(html)
      if (mainImg) {
        next.image = normalizeAmazonImageUrl(mainImg)
        cacheAmazonImageFromHtml(item.asin, html, imageCache)
      }

      const body = parseAmazonMonitorBodySpecs(html)
      const specs = parseSpecTable(html)
      const inferred = inferFromSpecs(specs, next.title)

      if (body.weight && body.weight !== DASH) next.weight = body.weight
      else if (inferred.weight) next.weight = inferred.weight
      if (inferred.screenSize) next.screenSize = inferred.screenSize
      if (inferred.resolution) next.resolution = inferred.resolution
      if (inferred.refreshRate) next.refreshRate = inferred.refreshRate
      if (inferred.panel) next.panel = inferred.panel
      if (inferred.connection) next.connection = inferred.connection
    }

    if (override.weight) next.weight = override.weight
    if (override.screenSize) next.screenSize = override.screenSize
    if (override.resolution) next.resolution = override.resolution
    if (override.refreshRate) next.refreshRate = override.refreshRate
    if (override.panel) next.panel = override.panel
    if (override.connection) next.connection = override.connection
    if (override.name) next.name = override.name
    if (override.brand) next.brand = override.brand
    if (override.price != null) next.price = override.price
    if (override.image) next.image = override.image

    enriched.push(next)
    console.log(
      `[${enriched.length}/${monitors.length}] ${item.asin} ${next.title?.slice(0, 60) ?? ""}`,
    )
  }

  writeFileSync(CACHE_PATH, JSON.stringify(imageCache, null, 2))
  writeFileSync(
    OUT_PATH,
    JSON.stringify({ fetchedAt: new Date().toISOString(), monitors: enriched }, null, 2),
  )
  console.log(`Wrote ${OUT_PATH} (${enriched.length} monitors)`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
