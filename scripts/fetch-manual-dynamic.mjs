const H = { "User-Agent": "Mozilla/5.0", "Accept-Language": "ja-JP" }
const asins = ["B0DZ5HLQC7", "B0GZ9BGKB2", "B00006I5R7", "B09W5MWL9Z", "B07MW2Z1CD"]
for (const a of asins) {
  const p = await fetch(`https://www.amazon.co.jp/dp/${a}`, { headers: H }).then((r) => r.text())
  const title = p.match(/id="productTitle"[^>]*>([\s\S]*?)<\//)?.[1]?.replace(/\s+/g, " ").trim()
  const price = p.match(/￥([\d,]+)/)?.[1]
  const rating = p.match(/5つ星のうち([\d.]+)/)?.[1]
  const reviews = p.match(/\(([\d,]+)\)/)?.[1]
  const img = p.match(/images\/I\/([^."']+)/)?.[1]
  console.log({ a, price, rating, reviews, img: img ? `https://m.media-amazon.com/images/I/${img}._AC_SL1500_.jpg` : "", title: title?.slice(0, 120) })
}
