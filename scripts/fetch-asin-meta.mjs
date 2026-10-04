/** Quick Amazon ASIN title/image fetch for debugging */
import { normalizeAmazonImageUrl } from "./amazon-image.mjs"

const asin = process.argv[2]
if (!asin) {
  console.error("Usage: node scripts/fetch-asin-meta.mjs ASIN")
  process.exit(1)
}

const html = await fetch(`https://www.amazon.co.jp/dp/${asin}`, {
  headers: {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64) Chrome/131.0.0.0",
    "Accept-Language": "ja-JP,ja;q=0.9",
  },
}).then((r) => r.text())

const title =
  html
    .match(/id="productTitle"[^>]*>([\s\S]*?)<\//)?.[1]
    ?.replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim() ?? ""

const image = normalizeAmazonImageUrl(
  html.match(/"hiRes":"(https:[^"]+)"/)?.[1] ||
    html.match(/"large":"(https:[^"]+)"/)?.[1] ||
    html.match(/data-old-hires="(https:[^"]+)"/)?.[1] ||
    "",
)

console.log(JSON.stringify({ asin, title, image, imageId: image.match(/\/I\/([^._]+)/)?.[1] }, null, 2))
