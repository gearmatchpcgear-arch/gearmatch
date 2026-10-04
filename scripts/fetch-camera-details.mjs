/**
 * camera-bestsellers-raw.json + 商品ページ詳細 → camera-bestsellers-catalog.json
 */
import { readFileSync, writeFileSync, existsSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { normalizeAmazonImageUrl, extractAmazonMainImage, cacheAmazonImageFromHtml } from "./amazon-image.mjs"
import { normalizeImportedPrice } from "./amazon-price.mjs"
import { buildCameraGadget } from "./amazon-camera-specs.mjs"
import { CAMERA_SPECS_KNOWN, EXTRA_CAMERA_ASINS } from "./camera-specs-known.mjs"
import { isCameraAccessory } from "./fetch-camera-bestsellers.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const RAW_PAGE1 = join(__dirname, "camera-bestsellers-raw.json")
const RAW_PAGE2 = join(__dirname, "camera-bestsellers-page2-raw.json")
const CACHE_PATH = join(__dirname, "camera-image-cache.json")
const OUT_PATH = join(__dirname, "camera-bestsellers-catalog.json")

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  "Accept-Language": "ja-JP,ja;q=0.9",
}

const imageCache = existsSync(CACHE_PATH)
  ? JSON.parse(readFileSync(CACHE_PATH, "utf8"))
  : {}

async function fetchPage(asin, retries = 2) {
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

function parseLivePrice(html) {
  const m =
    html.match(/class="a-price-whole">([\d,]+)/) ??
    html.match(/￥([\d,]+)/)
  return m ? Number(m[1].replace(/,/g, "")) : null
}

function loadRankingItems() {
  const page1 = JSON.parse(readFileSync(RAW_PAGE1, "utf8")).cameras
  const page2 = existsSync(RAW_PAGE2)
    ? JSON.parse(readFileSync(RAW_PAGE2, "utf8")).cameras
    : []
  const byAsin = new Map()
  for (const item of [...page1, ...page2]) {
    const existing = byAsin.get(item.asin)
    if (!existing || (item.rank ?? item.amazonRank) < (existing.rank ?? existing.amazonRank)) {
      byAsin.set(item.asin, item)
    }
  }
  return [...byAsin.values()]
    .filter((item) => !isCameraAccessory(item.title))
    .sort(
      (a, b) => (a.rank ?? a.amazonRank ?? 999) - (b.rank ?? b.amazonRank ?? 999),
    )
}

async function main() {
  const items = loadRankingItems()
  const seen = new Set(items.map((x) => x.asin))

  for (const extra of EXTRA_CAMERA_ASINS) {
    if (seen.has(extra.asin)) continue
    seen.add(extra.asin)
    items.push({
      asin: extra.asin,
      amazonRank: extra.rank,
      rank: extra.rank,
      title: extra.note,
      rating: 4.4,
      reviews: 0,
      price: null,
      image: "",
    })
  }

  console.log(`Total unique ASINs: ${items.length}`)

  const catalog = []

  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    const asin = item.asin
    process.stdout.write(`[${i + 1}/${items.length}] ${asin} ... `)

    const html = await fetchPage(asin)
    await new Promise((r) => setTimeout(r, 900))

    let title = item.title
    let price = item.price
    let image = item.image

    if (html) {
      const pageTitle = html.match(/id="productTitle"[^>]*>([\s\S]*?)<\/span>/)?.[1]
      if (pageTitle) title = pageTitle.replace(/<[^>]+>/g, "").trim()
      const livePrice = parseLivePrice(html)
      if (livePrice) price = livePrice
      cacheAmazonImageFromHtml(imageCache, asin, html)
      const fetchedImg = extractAmazonMainImage(html)
      if (fetchedImg) image = fetchedImg
    }

    image = normalizeAmazonImageUrl(image)
    price = normalizeImportedPrice(price)

    const known = CAMERA_SPECS_KNOWN[asin] ?? {}
    const gadget = buildCameraGadget(
      { ...item, title, price, image },
      { ...known, html: html ?? "", price: price ?? known.price, image: image || known.image },
    )

    catalog.push(gadget)
    console.log(`${gadget.name} | ${gadget.resolution} | ${gadget.fieldOfView}`)
  }

  writeFileSync(CACHE_PATH, JSON.stringify(imageCache, null, 2))
  writeFileSync(
    OUT_PATH,
    JSON.stringify({ fetchedAt: new Date().toISOString(), catalog }, null, 2),
  )
  console.log(`\nWrote ${catalog.length} items → ${OUT_PATH}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
