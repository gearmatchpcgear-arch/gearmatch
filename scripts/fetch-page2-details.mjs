const asins = ["B08HRW6V6N", "B013SYV6P2", "B0CHV2QZX7", "B07Q3FQ8K6"]
const HEADERS = { "User-Agent": "Mozilla/5.0", "Accept-Language": "ja-JP,ja;q=0.9" }
for (const asin of asins) {
  const html = await fetch(`https://www.amazon.co.jp/dp/${asin}`, { headers: HEADERS }).then((r) => r.text())
  const img =
    html.match(/images\/I\/([^._]+)\._AC_SL1500_/)?.[1] ||
    html.match(/images\/I\/([^._]+)\._AC_SX679_/)?.[1] ||
    html.match(/images\/I\/([^"._]+)/)?.[1]
  console.log(JSON.stringify({
    asin,
    title: html.match(/<title>([^<]+)/)?.[1]?.replace("Amazon.co.jp: ", "").slice(0, 90),
    price: html.match(/￥([\d,]+)/)?.[1],
    rating: html.match(/5つ星のうち([\d.]+)/)?.[1],
    reviews: html.match(/([\d,]+)\s*個の評価/)?.[1],
    img,
  }))
}
