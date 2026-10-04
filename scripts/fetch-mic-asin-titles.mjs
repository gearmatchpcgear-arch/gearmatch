const asins = process.argv.slice(2)
const H = { "User-Agent": "Mozilla/5.0", "Accept-Language": "ja-JP,ja;q=0.9" }
for (const asin of asins) {
  const html = await fetch(`https://www.amazon.co.jp/dp/${asin}`, { headers: H }).then((r) =>
    r.text(),
  )
  const title = html
    .match(/id="productTitle"[^>]*>([\s\S]*?)<\//)?.[1]
    ?.replace(/<[^>]+>/g, "")
    .trim()
  const price = html.match(/￥([\d,]+)/)?.[1]
  console.log(JSON.stringify({ asin, title, price }))
}
