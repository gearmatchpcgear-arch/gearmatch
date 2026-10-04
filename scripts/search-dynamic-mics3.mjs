const H = { "User-Agent": "Mozilla/5.0", "Accept-Language": "ja-JP" }
for (const q of ["Sennheiser e835", "ゼンハイザー e835", "400-MC002 3980", "サンワダイレクト 3980 ダイナミック"]) {
  const html = await fetch(`https://www.amazon.co.jp/s?k=${encodeURIComponent(q)}`, { headers: H }).then((r) => r.text())
  const asins = [...new Set([...html.matchAll(/data-asin="([A-Z0-9]{10})"/g)].map((m) => m[1]))].slice(0, 5)
  console.log("\nQ:", q)
  for (const a of asins.slice(0, 3)) {
    const p = await fetch(`https://www.amazon.co.jp/dp/${a}`, { headers: H }).then((r) => r.text())
    const title = p.match(/id="productTitle"[^>]*>([\s\S]*?)<\//)?.[1]?.replace(/\s+/g, " ").trim()?.slice(0, 95)
    if (/e835|400-MC002|3980|ダイナミック/i.test(title || p)) {
      console.log(" ", a, p.match(/￥([\d,]+)/)?.[1], title)
    }
  }
}
