/**
 * Enrich mic-most-gifted-raw.json with product page titles/prices/images.
 */
import { readFileSync, writeFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { normalizeAmazonImageUrl } from "./amazon-image.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const RAW_PATH = join(__dirname, "mic-most-gifted-raw.json")

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  "Accept-Language": "ja-JP,ja;q=0.9,en;q=0.8",
}

async function fetchProduct(asin) {
  const html = await fetch(`https://www.amazon.co.jp/dp/${asin}`, { headers: HEADERS }).then((r) =>
    r.text(),
  )
  const title = html
    .match(/id="productTitle"[^>]*>([\s\S]*?)<\//)?.[1]
    ?.replace(/<[^>]+>/g, "")
    .trim()
  const price = Number(
    html.match(/a-price-whole">([\d,]+)/)?.[1]?.replace(/,/g, "") ??
      html.match(/￥([\d,]+)/)?.[1]?.replace(/,/g, "") ??
      "0",
  )
  const rating = Number(html.match(/5つ星のうち([\d.]+)/)?.[1] ?? "0") || null
  const reviews = Number(html.match(/\(([\d,]+)\)/)?.[1]?.replace(/,/g, "") ?? "0") || 0
  const imgMatch =
    html.match(/"hiRes":"(https:\/\/m\.media-amazon\.com\/images\/I\/[^"]+)"/) ??
    html.match(/"large":"(https:\/\/m\.media-amazon\.com\/images\/I\/[^"]+)"/)
  const image = imgMatch ? normalizeAmazonImageUrl(imgMatch[1]) : ""
  return { title, price: price || null, rating, reviews, image }
}

const raw = JSON.parse(readFileSync(RAW_PATH, "utf8"))
const enriched = []

for (const item of raw.microphones) {
  process.stdout.write(`  ${item.asin}...`)
  try {
    const p = await fetchProduct(item.asin)
    enriched.push({
      ...item,
      title: p.title || item.title,
      price: p.price ?? item.price,
      rating: p.rating ?? item.rating,
      reviews: p.reviews || item.reviews,
      image: p.image || item.image,
    })
    console.log(" ok")
  } catch (e) {
    console.log(" fail", e.message)
    enriched.push(item)
  }
  await new Promise((r) => setTimeout(r, 800))
}

writeFileSync(
  RAW_PATH,
  JSON.stringify({ ...raw, fetchedAt: new Date().toISOString(), microphones: enriched }, null, 2),
)
console.log(`Updated ${enriched.length} items in ${RAW_PATH}`)
