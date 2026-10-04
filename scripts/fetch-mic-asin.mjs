const asins = [
  "B075PJ7V3V", // K669B
  "B0822PSXCN", // Snowball iCE
  "B08G8WH435", // QuadCast S
]
const HEADERS = {
  "User-Agent": "Mozilla/5.0",
  "Accept-Language": "ja-JP,ja;q=0.9",
}

for (const asin of asins) {
  const html = await fetch(`https://www.amazon.co.jp/dp/${asin}`, { headers: HEADERS }).then((r) => r.text())
  const title = html.match(/<title>([^<]+)/)?.[1]?.slice(0, 80)
  const price = html.match(/￥([\d,]+)/)?.[1]
  const rating = html.match(/5つ星のうち([\d.]+)/)?.[1]
  const reviews = html.match(/\(([\d,]+)\)/)?.[1]
  const img = html.match(/images\/I\/([^._]+)\._AC_SL1500_/)?.[1]
  console.log({ asin, title, price, rating, reviews, img })
}

// search U30K in ranking page full html
const rankHtml = await fetch("https://www.amazon.co.jp/gp/bestsellers/computers/2152017051", { headers: HEADERS }).then((r) => r.text())
const u30 = [...rankHtml.matchAll(/data-asin="([A-Z0-9]{10})"[\s\S]{0,5000}?U30K/gi)]
console.log("U30K matches:", u30.map((m) => m[1]))
const u30b = rankHtml.includes("U30K") ? "found text" : "not found"
console.log("U30K text:", u30b)

const queries = ["U30K マイク RGB", "U30K コンデンサーマイク 全指向性", "PC用マイク U30K 2710"]
for (const q of queries) {
  const searchHtml = await fetch(`https://www.amazon.co.jp/s?k=${encodeURIComponent(q)}`, { headers: HEADERS }).then((r) => r.text())
  const hits = [...searchHtml.matchAll(/data-asin=\"([A-Z0-9]{10})\"/g)].map((m) => m[1]).filter(Boolean).slice(0, 5)
  console.log("Q:", q, hits)
  for (const asin of hits.slice(0, 2)) {
    const html = await fetch(`https://www.amazon.co.jp/dp/${asin}`, { headers: HEADERS }).then((r) => r.text())
    if (/U30K/i.test(html)) {
      console.log("FOUND U30K", asin, html.match(/￥([\d,]+)/)?.[1])
    }
  }
}
