import { normalizeAmazonImageUrl } from "./amazon-image.mjs"

const asin = process.argv[2]
const H = { "User-Agent": "Mozilla/5.0", "Accept-Language": "ja-JP" }
const html = await fetch(`https://www.amazon.co.jp/dp/${asin}`, { headers: H }).then((r) =>
  r.text(),
)
const imgMatch =
  html.match(/"hiRes":"(https:\/\/m\.media-amazon\.com\/images\/I\/[^"]+)"/) ??
  html.match(/"large":"(https:\/\/m\.media-amazon\.com\/images\/I\/[^"]+)"/)
console.log(imgMatch ? normalizeAmazonImageUrl(imgMatch[1]) : "not found")
