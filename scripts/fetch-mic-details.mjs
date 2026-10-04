const asins = [
  "B0FLKJ7FH7", // SoloCast 2
  "B0GJZ1TCQP", // U30K rank 2
  "B0G39C97WQ", // DJI Mic Mini 2
  "B075PJ7V3V", // FIFINE K669B
  "B0822PSXCN", // Snowball iCE
  "B08G8WH435", // QuadCast S
]
const HEADERS = {
  "User-Agent": "Mozilla/5.0",
  "Accept-Language": "ja-JP,ja;q=0.9",
}

for (const asin of asins) {
  const html = await fetch(`https://www.amazon.co.jp/dp/${asin}`, { headers: HEADERS }).then((r) => r.text())
  const title = html.match(/<title>([^<]+)/)?.[1]?.replace("Amazon.co.jp: ", "").slice(0, 120)
  const price = html.match(/￥([\d,]+)/)?.[1]
  const rating = html.match(/5つ星のうち([\d.]+)/)?.[1]
  const reviewsMatch = html.match(/([\d,]+)\s*個の評価/) || html.match(/\(([\d,]+)\)/)
  const reviews = reviewsMatch?.[1]
  const img = html.match(/images\/I\/([^._]+)\._AC_SL1500_/)?.[1]
  const u30k = /U30K/i.test(html)
  console.log(JSON.stringify({ asin, u30k, title, price, rating, reviews, img }))
}
