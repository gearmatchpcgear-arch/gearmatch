const H = { "User-Agent": "Mozilla/5.0", "Accept-Language": "ja-JP" }
const asins = ["B009GY4E2G", "B0G5D9JT5G", "B000SAGSRQ", "B0D8KF3PV2", "B09N955HJJ"]
for (const a of asins) {
  const p = await fetch(`https://www.amazon.co.jp/dp/${a}`, { headers: H }).then((r) => r.text())
  console.log(a, p.match(/￥([\d,]+)/)?.[1], p.match(/id="productTitle"[^>]*>([\s\S]*?)<\//)?.[1]?.replace(/\s+/g," ").trim()?.slice(0,100))
}
