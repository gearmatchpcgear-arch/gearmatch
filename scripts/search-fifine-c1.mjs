const H = { "User-Agent": "Mozilla/5.0", "Accept-Language": "ja-JP,ja;q=0.9" }
const qs = ["FIFINE C1 ラベリア", "FIFINE クリップマイク 3.5mm 全指向性", "FIFINE ピンマイク 1699"]
for (const q of qs) {
  const html = await fetch(`https://www.amazon.co.jp/s?k=${encodeURIComponent(q)}`, { headers: H }).then((r) => r.text())
  const asins = [...new Set([...html.matchAll(/data-asin="([A-Z0-9]{10})"/g)].map((m) => m[1]).filter(Boolean))].slice(0, 5)
  console.log("\nQ:", q)
  for (const a of asins) {
    const p = await fetch(`https://www.amazon.co.jp/dp/${a}`, { headers: H }).then((r) => r.text())
    if (/C1|クリップ|ラベリア|lavalier|ピンマイク/i.test(p)) {
      console.log(JSON.stringify({
        asin: a,
        title: p.match(/<title>([^<]+)/)?.[1]?.replace("Amazon.co.jp: ", "").slice(0, 100),
        price: p.match(/￥([\d,]+)/)?.[1],
        rating: p.match(/5つ星のうち([\d.]+)/)?.[1],
        img: p.match(/images\/I\/([^._]+)\._AC_SL1500_/)?.[1],
      }))
    }
  }
}
