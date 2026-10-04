const HEADERS = {
  "User-Agent": "Mozilla/5.0",
  "Accept-Language": "ja-JP,ja;q=0.9",
}

const candidates = [
  "B0GKX5TXSX",
  "B0FKBV629V",
  "B092JB6XR3",
  "B0GJZ1TCQP",
  "B0BXSPQL3W",
  "B08NDQ772P",
]

for (const asin of candidates) {
  const html = await fetch(`https://www.amazon.co.jp/dp/${asin}`, { headers: HEADERS }).then((r) => r.text())
  const title = html.match(/<title>([^<]+)/)?.[1]?.slice(0, 100)
  const price = html.match(/￥([\d,]+)/)?.[1]
  const rating = html.match(/5つ星のうち([\d.]+)/)?.[1]
  const reviews = html.match(/\(([\d,]+)\)/)?.[1]
  const img = html.match(/images\/I\/([^._]+)\._AC_SL1500_/)?.[1]
  const hasU30K = /U30K/i.test(html)
  console.log({ asin, hasU30K, title, price, rating, reviews, img })
}
