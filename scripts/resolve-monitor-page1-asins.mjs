/**
 * Resolve missing ASINs in monitor-bestsellers-page1-catalog.json via Amazon search.
 */
import { readFileSync, writeFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { normalizeAmazonImageUrl } from "./amazon-image.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const CATALOG_PATH = join(__dirname, "monitor-bestsellers-page1-catalog.json")
const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  "Accept-Language": "ja-JP,ja;q=0.9,en;q=0.8",
}

async function fetchText(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    const html = await fetch(url, { headers: HEADERS }).then((r) => r.text())
    if (html.length > 5000) return html
    await new Promise((r) => setTimeout(r, 1500 * (i + 1)))
  }
  throw new Error(`blocked: ${url}`)
}

function findAsin(html) {
  const m =
    html.match(/data-asin="([A-Z0-9]{10})"/) ??
    html.match(/\/dp\/([A-Z0-9]{10})/)
  return m ? m[1].toUpperCase() : null
}

function parseProductPage(html) {
  const ratingMatch = html.match(/5つ星のうち([\d.]+)/)
  const reviewsMatch = html.match(/([\d,]+)\s*(?:個の評価|ratings)/i)
  const priceMatch =
    html.match(/a-price-whole">([\d,]+)/) ??
    html.match(/_cDEzb_p13n-sc-price_3mJ9Z">￥([\d,]+)/)
  const imgMatch = html.match(/"(https:\/\/[^"]+images\/I\/[^"]+)"/)
  return {
    rating: ratingMatch ? Number(ratingMatch[1]) : 4.0,
    reviews: reviewsMatch ? Number(reviewsMatch[1].replace(/,/g, "")) : 0,
    price: priceMatch ? Number(priceMatch[1].replace(/,/g, "")) : null,
    image: imgMatch ? normalizeAmazonImageUrl(imgMatch[1]) : "",
  }
}

async function resolveAsin(query) {
  const url = `https://www.amazon.co.jp/s?k=${encodeURIComponent(query)}&i=computers`
  const html = await fetchText(url)
  return findAsin(html)
}

async function enrichFromAsin(asin) {
  const html = await fetchText(`https://www.amazon.co.jp/dp/${asin}`)
  return parseProductPage(html)
}

async function main() {
  const catalog = JSON.parse(readFileSync(CATALOG_PATH, "utf8"))
  for (const item of catalog) {
    if (!item.asin && item.search) {
      try {
        item.asin = await resolveAsin(item.search)
        console.log(`#${item.rank} resolved ${item.asin} ← ${item.search}`)
      } catch (e) {
        console.warn(`#${item.rank} ASIN lookup failed: ${item.search}`)
      }
      await new Promise((r) => setTimeout(r, 1200))
    }
    if (item.asin) {
      try {
        const meta = await enrichFromAsin(item.asin)
        if (meta.image) item.image = meta.image
        if (meta.rating) item.rating = meta.rating
        if (meta.reviews) item.reviews = meta.reviews
        if (meta.price && !item.price) item.price = meta.price
      } catch {
        /* keep catalog price */
      }
      await new Promise((r) => setTimeout(r, 800))
    }
  }
  writeFileSync(CATALOG_PATH, JSON.stringify(catalog, null, 2))
  const missing = catalog.filter((x) => !x.asin)
  console.log(`Done. missing ASINs: ${missing.length}`)
  if (missing.length) missing.forEach((x) => console.log(`  #${x.rank} ${x.search ?? x.name}`))
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
