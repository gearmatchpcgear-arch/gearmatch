const H = {
  "User-Agent": "Mozilla/5.0",
  "Accept-Language": "ja-JP",
}
const qs = [
  "e835 507421",
  "sE V7 マイク",
  "サンワサプライ 400-MC002 XLR",
  "MM-MC002 ダイナミック",
  "B07MW2Z1CD",
]
for (const q of qs) {
  const url = q.startsWith("B0")
    ? `https://www.amazon.co.jp/dp/${q}`
    : `https://www.amazon.co.jp/s?k=${encodeURIComponent(q)}`
  const html = await fetch(url, { headers: H }).then((r) => r.text())
  if (q.startsWith("B0")) {
    console.log(q, html.match(/￥([\d,]+)/)?.[1], html.match(/id="productTitle"[^>]*>([\s\S]*?)<\//)?.[1]?.replace(/\s+/g, " ").trim()?.slice(0, 100))
    continue
  }
  const asins = [...new Set([...html.matchAll(/data-asin="([A-Z0-9]{10})"/g)].map((m) => m[1]))].slice(0, 4)
  console.log("\nQ:", q, asins.join(" "))
  for (const a of asins.slice(0, 2)) {
    const p = await fetch(`https://www.amazon.co.jp/dp/${a}`, { headers: H }).then((r) => r.text())
    console.log(" ", a, p.match(/￥([\d,]+)/)?.[1], p.match(/id="productTitle"[^>]*>([\s\S]*?)<\//)?.[1]?.replace(/\s+/g, " ").trim()?.slice(0, 90))
  }
}
