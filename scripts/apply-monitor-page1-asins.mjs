/**
 * Resolve ASINs for monitor-bestsellers-page1-catalog.json via Amazon search.
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

/** Manual overrides where search is unreliable */
const OVERRIDES = {
  1: "B07ZNTHZHZ",
  2: "B0D1K8H4F5",
  3: "B0D9K624F9",
  4: "B0FPF1HGT8",
  5: "B0DNDXMLR7",
  6: "B0CDBS93QZ",
  7: "B0CPXQQLL2",
  8: "B0DD6GJVV5",
  9: "B0FH73NMT4",
  10: "B0CFXKB7T2",
  11: "B0DZ6LG8PZ",
  12: "B0GNRS88NQ",
  13: "B0D9K8WK2Q",
  14: "B09SV4VKXR",
  15: "B0FCQPC9FQ",
  16: "B0BQF3JKQF",
  17: "B0CKYNFG4B",
  18: "B0F9WJLW45",
  19: "B0F18KF4HH",
  20: "B0CTM6T5C2",
  21: "B0FH58W9NF",
  22: "B0CLNTRCXV",
  23: "B0CXXR9HRQ",
  24: "B011OBZ5Y4",
  25: "B0BLRZ5HJM",
  26: "B0C9PVL4FM",
  27: "B0CHJ8N9MJ",
  28: "B08L6W9W8W",
  29: "B0DG4RKZMD",
  30: "B0C6DSXXJV",
  31: "B0C2125FZK",
  32: "B0CPXQQLL2",
  33: "B07Y5VJ8XG",
  34: "B0BLRZ5HJM",
  35: "B0F2DY8BF7",
  36: "B0C7VQPLS1",
  37: "B0DWZYWMH3",
  38: "B077SBB5SH",
  39: "B0DC46F5HK",
  40: "B0GVYKG7CW",
  41: "B0DNKC8HXP",
  42: "B0DNDXMLR7",
  43: "B0CLNTRCXV",
  44: "B0G42QB93M",
  45: "B0FSR8RKDF",
  46: "B0FX4V8L8N",
  47: "B0F23DY221",
  48: "B0DPKL9R3Q",
  49: "B0D9KGG1B6",
  50: "B0DZ5BRBZ7",
}

async function fetchText(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    const res = await fetch(url, { headers: HEADERS })
    const html = await res.text()
    if (html.length > 5000) return html
    await new Promise((r) => setTimeout(r, 1500 * (i + 1)))
  }
  throw new Error(`blocked: ${url}`)
}

function parseProductPage(html) {
  const title =
    html.match(/<span id="productTitle"[^>]*>([\s\S]*?)<\/span>/)?.[1]?.trim() ??
    html.match(/<title>([^<]+)/)?.[1]?.split(":")[0]?.trim() ??
    ""
  const ratingMatch = html.match(/5つ星のうち([\d.]+)/)
  const reviewsMatch = html.match(/([\d,]+)\s*(?:個の評価|ratings)/i)
  const priceMatch =
    html.match(/a-price-whole">([\d,]+)/) ??
    html.match(/_cDEzb_p13n-sc-price_3mJ9Z">￥([\d,]+)/)
  const imgMatch = html.match(/"(https:\/\/[^"]+images\/I\/[^"]+)"/)
  return {
    title: title.replace(/\s+/g, " ").slice(0, 200),
    rating: ratingMatch ? Number(ratingMatch[1]) : 4.0,
    reviews: reviewsMatch ? Number(reviewsMatch[1].replace(/,/g, "")) : 0,
    price: priceMatch ? Number(priceMatch[1].replace(/,/g, "")) : null,
    image: imgMatch ? normalizeAmazonImageUrl(imgMatch[1]) : "",
  }
}

async function main() {
  const catalog = JSON.parse(readFileSync(CATALOG_PATH, "utf8"))
  const report = []

  for (const item of catalog.sort((a, b) => a.rank - b.rank)) {
    const asin = OVERRIDES[item.rank] ?? item.asin
    if (!asin) {
      report.push({ rank: item.rank, error: "no asin" })
      continue
    }
    item.asin = asin
    try {
      const html = await fetchText(`https://www.amazon.co.jp/dp/${asin}`)
      const meta = parseProductPage(html)
      if (meta.image) item.image = meta.image
      if (meta.rating) item.rating = meta.rating
      if (meta.reviews) item.reviews = meta.reviews
      report.push({
        rank: item.rank,
        asin,
        ok: meta.title.length > 5,
        title: meta.title,
        name: item.name,
        brand: item.brand,
      })
    } catch (e) {
      report.push({ rank: item.rank, asin, error: String(e.message) })
    }
    await new Promise((r) => setTimeout(r, 900))
  }

  writeFileSync(CATALOG_PATH, JSON.stringify(catalog, null, 2))
  console.log(JSON.stringify(report, null, 2))
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
