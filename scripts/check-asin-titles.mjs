const H = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/131.0.0.0",
  "Accept-Language": "ja-JP,ja;q=0.9",
}
const asin = process.argv[2] ?? "B07LH1ZDSL"
const html = await fetch(`https://www.amazon.co.jp/dp/${asin}`, { headers: H }).then((r) => r.text())
const title = html.match(/id="productTitle"[^>]*>([\s\S]*?)<\//)?.[1]?.replace(/<[^>]+>/g, "").trim()
const img = html.match(/"hiRes":"(https:[^"]+)"/)?.[1] || html.match(/"large":"(https:[^"]+)"/)?.[1] || ""
console.log(JSON.stringify({ asin, title, image: img }))
