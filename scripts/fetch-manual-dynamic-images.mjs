import { normalizeAmazonImageUrl } from "./amazon-image.mjs"

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  "Accept-Language": "ja-JP,ja;q=0.9,en;q=0.8",
}
const asins = ["B0DZ5HLQC7", "B00006I5R7", "B09W5MWL9Z", "B07MW2Z1CD"]
for (const asin of asins) {
  const html = await fetch(`https://www.amazon.co.jp/dp/${asin}`, { headers: HEADERS }).then((r) => r.text())
  const imgRaw = html.match(/src="(https:\/\/[^"]+images\/I\/[^"]+)"/)?.[1]
  const reviews = Number(html.match(/a-size-small">([\d,]+)</)?.[1]?.replace(/,/g, "") ?? "0")
  const rating = Number(html.match(/5つ星のうち([\d.]+)/)?.[1] ?? "4")
  console.log(asin, normalizeAmazonImageUrl(imgRaw || ""), rating, reviews)
}
