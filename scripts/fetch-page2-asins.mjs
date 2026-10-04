const asins = ["B08118HN2H", "B07Q3FQ8K6", "B0CHV2QZX7", "B013SYV6P2", "B08DD66Q9R", "B0F2DSX6BN", "B0DM2GF8MW"]
const HEADERS = { "User-Agent": "Mozilla/5.0", "Accept-Language": "ja-JP,ja;q=0.9" }
for (const asin of asins) {
  const html = await fetch(`https://www.amazon.co.jp/dp/${asin}`, { headers: HEADERS }).then((r) => r.text())
  const ok = !html.includes("ページが見つかりません") && !html.includes("currently unavailable")
  console.log(JSON.stringify({
    asin,
    ok,
    title: html.match(/<title>([^<]+)/)?.[1]?.replace("Amazon.co.jp: ", "").slice(0, 110),
    price: html.match(/￥([\d,]+)/)?.[1],
    rating: html.match(/5つ星のうち([\d.]+)/)?.[1],
    img: html.match(/images\/I\/([^._]+)\._AC_SL1500_/)?.[1],
  }))
}
