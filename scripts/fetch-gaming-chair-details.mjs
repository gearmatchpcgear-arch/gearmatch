/**
 * gaming-chair-bestsellers-raw.json + 商品ページ詳細 → gaming-chair-bestsellers-catalog.json
 */
import { readFileSync, writeFileSync, existsSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import {
  normalizeAmazonImageUrl,
  extractAmazonMainImage,
  cacheAmazonImageFromHtml,
} from "./amazon-image.mjs"
import { normalizeImportedPrice } from "./amazon-price.mjs"
import { buildGamingChairGadget } from "./amazon-gaming-chair-specs.mjs"
import { isGamingChairAccessory } from "./gaming-chair-accessory-filter.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const RAW_PATH = join(__dirname, "gaming-chair-bestsellers-raw.json")
const CACHE_PATH = join(__dirname, "gaming-chair-image-cache.json")
const OUT_PATH = join(__dirname, "gaming-chair-bestsellers-catalog.json")

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

function parseLivePrice(html) {
  const m =
    html.match(/class="a-price-whole">([\d,]+)/) ??
    html.match(/a-offscreen">￥([\d,]+)/) ??
    html.match(/￥([\d,]+)/)
  return m ? Number(m[1].replace(/,/g, "")) : null
}

function parseReviews(html) {
  const m =
    html.match(/acrCustomerReviewText[^>]*>\s*([\d,]+)/) ??
    html.match(/"reviewCount"\s*:\s*"([\d,]+)"/)
  return m ? Number(m[1].replace(/,/g, "")) : null
}

function parseRating(html) {
  const m =
    html.match(/5つ星のうち([\d.]+)/) ??
    html.match(/"ratingValue"\s*:\s*"([\d.]+)"/)
  return m ? Number(m[1]) : null
}

async function main() {
  const { gamingChairs } = JSON.parse(readFileSync(RAW_PATH, "utf8"))
  const items = gamingChairs
    .filter((item) => !isGamingChairAccessory(item.title))
    .sort((a, b) => (a.rank ?? a.amazonRank) - (b.rank ?? b.amazonRank))

  console.log(`Fetching details for ${items.length} chairs...`)
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
    let rating = item.rating
    let reviews = item.reviews

    if (html) {
      const pageTitle = html.match(/id="productTitle"[^>]*>([\s\S]*?)<\/span>/)?.[1]
      if (pageTitle) title = pageTitle.replace(/<[^>]+>/g, "").trim()
      const livePrice = parseLivePrice(html)
      if (livePrice) price = livePrice
      const liveReviews = parseReviews(html)
      if (liveReviews != null) reviews = liveReviews
      const liveRating = parseRating(html)
      if (liveRating != null) rating = liveRating
      cacheAmazonImageFromHtml(imageCache, asin, html)
      const fetchedImg = extractAmazonMainImage(html)
      if (fetchedImg) image = fetchedImg
    }

    image = normalizeAmazonImageUrl(image)
    price = normalizeImportedPrice(price)

    const gadget = buildGamingChairGadget(
      { ...item, title, price, image, rating, reviews },
      { html: html ?? "", price, image, rating, reviews },
    )

    catalog.push(gadget)
    console.log(`${gadget.name} | ${gadget.highlights[0].value} | ¥${price ?? "?"}`)
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
