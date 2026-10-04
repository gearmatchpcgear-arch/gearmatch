const H = { "User-Agent": "Mozilla/5.0", "Accept-Language": "ja-JP" }
for (const q of ["400-MC002 サンワ", "400-SP045", "site:amazon.co.jp 400-MC002 ダイナミック"]) {
  const html = await fetch(`https://www.amazon.co.jp/s?k=${encodeURIComponent(q)}`, { headers: H }).then((r) => r.text())
  const asins = [...new Set([...html.matchAll(/data-asin="([A-Z0-9]{10})"/g)].map((m) => m[1]))].slice(0, 6)
  console.log("\nQ:", q)
  for (const a of asins) {
    const p = await fetch(`https://www.amazon.co.jp/dp/${a}`, { headers: H }).then((r) => r.text())
    const title = p.match(/id="productTitle"[^>]*>([\s\S]*?)<\//)?.[1]?.replace(/\s+/g, " ").trim()?.slice(0, 100)
    if (/400-MC002|400-SP045|MC002|SP045/i.test(title || "")) {
      console.log(" ", a, p.match(/￥([\d,]+)/)?.[1], title)
    }
  }
}
