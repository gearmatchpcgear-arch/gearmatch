const asins = ["B075PJ7V3V", "B0822PSXCN", "B08G8WH435"]
const HEADERS = { "User-Agent": "Mozilla/5.0", "Accept-Language": "ja-JP,ja;q=0.9" }
for (const asin of asins) {
  const html = await fetch(`https://www.amazon.co.jp/dp/${asin}`, { headers: HEADERS }).then((r) => r.text())
  const patterns = [
    /([\d,]+)\s*個の評価/,
    /([\d,]+)\s*ratings/i,
    /customerReviewsCount["\s:]+([\d,]+)/,
    /"reviewCount"\s*:\s*"([\d,]+)"/,
    /acrCustomerReviewText[^>]*>([\d,]+)/,
  ]
  for (const p of patterns) {
    const m = html.match(p)
    if (m) console.log(asin, p.toString().slice(0, 40), m[1])
  }
}
