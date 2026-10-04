import { parseAmazonPrice } from "./amazon-price.mjs"

const asins = ["B0BW8W1VN3", "B0D6QB71XD", "B0GWNQWXMF", "B08QHYD2BP", "B01L8H204W"]
const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/131.0.0.0",
  "Accept-Language": "ja-JP,ja;q=0.9",
}

for (const asin of asins) {
  const res = await fetch(`https://www.amazon.co.jp/dp/${asin}`, { headers: HEADERS })
  const html = await res.text()
  const title =
    html.match(/id="productTitle"[^>]*>([\s\S]*?)<\//)?.[1]?.replace(/\s+/g, " ").trim() ?? ""
  const used = /購入\s*中古|Currently unavailable|在庫切れ|新品の出品者がありません/i.test(html)
  console.log(
    JSON.stringify({
      asin,
      status: res.status,
      len: html.length,
      price: parseAmazonPrice(html),
      used,
      title: title.slice(0, 80),
    }),
  )
}
