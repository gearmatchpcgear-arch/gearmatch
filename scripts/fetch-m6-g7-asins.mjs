const ASINS = ["B0FKB5X4XZ", "B0DXPBGBPH", "B0FKB873SR", "B0H448HXD7"]
const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  "Accept-Language": "ja-JP,ja;q=0.9",
}

for (const asin of ASINS) {
  const res = await fetch(`https://www.amazon.co.jp/dp/${asin}`, { headers: HEADERS })
  const html = await res.text()
  const title = html.match(/id="productTitle"[^>]*>([\s\S]*?)<\/span>/)?.[1]
  console.log(asin, title?.replace(/<[^>]+>/g, "").trim())
  await new Promise((r) => setTimeout(r, 900))
}
