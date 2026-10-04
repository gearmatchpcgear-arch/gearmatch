const H = { "User-Agent": "Mozilla/5.0", "Accept-Language": "ja-JP" }
const qs = [
  "PROH7F Superlux",
  "MACKIE EM-89D マイク",
  "SM63LB シュア",
  "SM63LB SHURE",
  "PGA58 シュア",
  "Superlux D112/C",
]
for (const q of qs) {
  const html = await fetch(`https://www.amazon.co.jp/s?k=${encodeURIComponent(q)}`, { headers: H }).then((r) => r.text())
  const asins = [...new Set([...html.matchAll(/data-asin="([A-Z0-9]{10})"/g)].map((m) => m[1]))].slice(0, 4)
  console.log("\n", q)
  for (const a of asins.slice(0, 2)) {
    const p = await fetch(`https://www.amazon.co.jp/dp/${a}`, { headers: H }).then((r) => r.text())
    console.log(a, p.match(/￥([\d,]+)/)?.[1], p.match(/id="productTitle"[^>]*>([\s\S]*?)<\//)?.[1]?.replace(/\s+/g," ").trim()?.slice(0,85))
  }
}
