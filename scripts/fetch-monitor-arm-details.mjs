/**
 * monitor-arm-bestsellers-raw.json + 商品ページ詳細 → monitor-arm-bestsellers-catalog.json
 */
import { readFileSync, writeFileSync, existsSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import {
  normalizeAmazonImageUrl,
  extractAmazonMainImage,
  cacheAmazonImageFromHtml,
} from "./amazon-image.mjs"
import { normalizeImportedPrice, parseAmazonPrice } from "./amazon-price.mjs"
import { buildMonitorArmGadget } from "./amazon-monitor-arm-specs.mjs"
import { MONITOR_ARM_SPECS_KNOWN, EXTRA_MONITOR_ARM_ASINS } from "./monitor-arm-specs-known.mjs"
import { isMonitorArmBody, isMonitorArmAccessory } from "./monitor-arm-accessory-filter.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const RAW_PAGE1 = join(__dirname, "monitor-arm-bestsellers-raw.json")
const RAW_PAGE2 = join(__dirname, "monitor-arm-bestsellers-page2-raw.json")
const RAW_SEARCH = join(__dirname, "monitor-arm-search-raw.json")
const RAW_SEARCH_FEATURED_P2 = join(__dirname, "monitor-arm-search-featured-page2-raw.json")
const CACHE_PATH = join(__dirname, "monitor-arm-image-cache.json")
const OUT_PATH = join(__dirname, "monitor-arm-bestsellers-catalog.json")
const EXISTING_CATALOG_PATH = OUT_PATH

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  "Accept-Language": "ja-JP,ja;q=0.9",
}

const imageCache = existsSync(CACHE_PATH)
  ? JSON.parse(readFileSync(CACHE_PATH, "utf8"))
  : {}

async function fetchPage(asin, retries = 3) {
  for (let i = 0; i < retries; i++) {
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

function parseLiveTitle(html) {
  const m = html.match(/id="productTitle"[^>]*>\s*([\s\S]*?)<\/span>/)
  return m ? m[1].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim() : null
}

function loadRankingItems() {
  const sources = []
  if (existsSync(RAW_PAGE1)) {
    sources.push(...JSON.parse(readFileSync(RAW_PAGE1, "utf8")).monitorArms)
  }
  if (existsSync(RAW_PAGE2)) {
    sources.push(...JSON.parse(readFileSync(RAW_PAGE2, "utf8")).monitorArms)
  }
  if (existsSync(RAW_SEARCH)) {
    sources.push(...JSON.parse(readFileSync(RAW_SEARCH, "utf8")).monitorArms)
  }
  if (existsSync(RAW_SEARCH_FEATURED_P2)) {
    sources.push(...JSON.parse(readFileSync(RAW_SEARCH_FEATURED_P2, "utf8")).monitorArms)
  }
  if (sources.length === 0) {
    throw new Error("No monitor arm raw data. Run fetch scripts first.")
  }

  const byAsin = new Map()
  for (const item of sources) {
    if (!isMonitorArmBody(item.title, item.asin)) continue
    const existing = byAsin.get(item.asin)
    const itemRank = item.rank ?? item.amazonRank ?? 9999
    const existingRank = existing?.rank ?? existing?.amazonRank ?? 9999
    if (!existing || itemRank < existingRank) {
      byAsin.set(item.asin, item)
    }
  }
  return [...byAsin.values()].sort(
    (a, b) => (a.rank ?? a.amazonRank ?? 9999) - (b.rank ?? b.amazonRank ?? 9999),
  )
}

function loadExistingCatalogMap() {
  if (!existsSync(EXISTING_CATALOG_PATH)) return new Map()
  try {
    const { catalog } = JSON.parse(readFileSync(EXISTING_CATALOG_PATH, "utf8"))
    return new Map(catalog.map((g) => [g.asin ?? g.purchaseUrl?.replace(/.*\/dp\//, ""), g]))
  } catch {
    return new Map()
  }
}

async function main() {
  const items = loadRankingItems()
  const seen = new Set(items.map((x) => x.asin))
  for (const extra of EXTRA_MONITOR_ARM_ASINS) {
    if (seen.has(extra.asin)) continue
    seen.add(extra.asin)
    items.push({
      asin: extra.asin,
      amazonRank: extra.rank,
      rank: extra.rank,
      title: extra.note,
      rating: 4.2,
      reviews: 842,
      price: MONITOR_ARM_SPECS_KNOWN[extra.asin]?.price ?? null,
      image: "",
    })
  }
  console.log(`Processing ${items.length} monitor arm bodies`)

  const existingCatalog = loadExistingCatalogMap()
  const catalog = []

  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    const asin = item.asin
    const existing = existingCatalog.get(asin)
    process.stdout.write(`[${i + 1}/${items.length}] ${asin} ... `)

    let title = item.title
    let image = item.image ?? existing?.image ?? ""
    let price = item.price ?? existing?.price ?? null
    let html = null

    if (!existing || !image) {
      html = await fetchPage(asin)
      await new Promise((r) => setTimeout(r, 900))

      if (html) {
        title = parseLiveTitle(html) ?? title
        const livePrice = parseAmazonPrice(html)
        if (livePrice) price = livePrice
        const mainImage = extractAmazonMainImage(html)
        if (mainImage) image = mainImage
        cacheAmazonImageFromHtml(imageCache, asin, html)
      }
    } else if (item.price) {
      price = item.price
    }

    if (isMonitorArmAccessory(title) || isMonitorArmBody(title, asin) === false) {
      console.log(`skip accessory: ${title.slice(0, 48)}`)
      continue
    }

    if (!html && existing?.name && isMonitorArmAccessory(existing.name)) {
      console.log(`skip accessory (cached): ${existing.name.slice(0, 48)}`)
      continue
    }

    if (imageCache[asin]?.image) image = imageCache[asin].image

    const known = MONITOR_ARM_SPECS_KNOWN[asin] ?? {}
    const built = buildMonitorArmGadget(
      { ...item, title, price: normalizeImportedPrice(price, asin, MONITOR_ARM_SPECS_KNOWN), image },
      {
        html: html ?? "",
        id:
          existing?.id ??
          (item.rank >= 2000
            ? `arm-fp2-${String(item.amazonRank).padStart(3, "0")}`
            : item.rank >= 1000
              ? `arm-sr-${String(item.amazonRank).padStart(3, "0")}`
              : undefined),
        ...known,
      },
    )

    catalog.push(built)
    console.log(built.name)
  }

  writeFileSync(CACHE_PATH, JSON.stringify(imageCache, null, 2))
  writeFileSync(OUT_PATH, JSON.stringify({ catalog }, null, 2))
  console.log(`Wrote ${catalog.length} items → ${OUT_PATH}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
