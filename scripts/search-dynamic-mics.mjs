const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131 Safari/537.36",
  "Accept-Language": "ja-JP,ja;q=0.9",
}
const queries = [
  "サンワダイレクト ダイナミックマイク 400-MC002",
  "Sennheiser e835 ダイナミック",
  "sE Electronics V7 ダイナミック",
  "AUDIO NEXSUS ANM-865",
]
for (const q of queries) {
  const html = await fetch(`https://www.amazon.co.jp/s?k=${encodeURIComponent(q)}`, {
    headers: HEADERS,
  }).then((r) => r.text())
  const asins = [...new Set([...html.matchAll(/data-asin="([A-Z0-9]{10})"/g)].map((m) => m[1]))].slice(0, 3)
  console.log("\nQ:", q)
  for (const asin of asins) {
    const p = await fetch(`https://www.amazon.co.jp/dp/${asin}`, { headers: HEADERS }).then((r) => r.text())
    const title = p.match(/id="productTitle"[^>]*>([\s\S]*?)<\//)?.[1]?.replace(/\s+/g, " ").trim()?.slice(0, 100)
    const price = p.match(/￥([\d,]+)/)?.[1]
    console.log(" ", asin, price, title)
  }
}
