const HEADERS = { "User-Agent": "Mozilla/5.0", "Accept-Language": "ja-JP,ja;q=0.9" }
async function detail(asin) {
  const html = await fetch(`https://www.amazon.co.jp/dp/${asin}`, { headers: HEADERS }).then((r) => r.text())
  return {
    asin,
    title: html.match(/<title>([^<]+)/)?.[1]?.replace("Amazon.co.jp: ", "").slice(0, 120),
    price: html.match(/￥([\d,]+)/)?.[1],
    rating: html.match(/5つ星のうち([\d.]+)/)?.[1],
    img: html.match(/images\/I\/([^._]+)\._AC_SL1500_/)?.[1],
  }
}
for (const q of ["FIFINE C1 ピンマイク", "FIFINE K036 C1", "eMeet M0 3999", "EMEET Office M0"]) {
  const html = await fetch(`https://www.amazon.co.jp/s?k=${encodeURIComponent(q)}`, { headers: HEADERS }).then((r) => r.text())
  const asins = [...new Set([...html.matchAll(/data-asin="([A-Z0-9]{10})"/g)].map((m) => m[1]).filter(Boolean))].slice(0, 5)
  console.log("\n", q)
  for (const a of asins) console.log(JSON.stringify(await detail(a)))
}
