const H = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/131 Safari/537.36",
  "Accept-Language": "ja-JP,ja;q=0.9",
}
const queries = [
  "Superlux PROH7F ガイコツ",
  "MACKIE EM-89D",
  "TOA DM-1200 ダイナミック",
  "SHURE SM63LB",
  "Samson Q6 ダイナミック",
  "UNI-PEX MD-5A",
  "Superlux D112",
  "MEDIACOM TKY-93",
  "Shure PGA58",
  "Audio-Technica AT2040 BX3",
]
for (const q of queries) {
  const html = await fetch(`https://www.amazon.co.jp/s?k=${encodeURIComponent(q)}`, { headers: H }).then((r) => r.text())
  const asins = [...new Set([...html.matchAll(/data-asin="([A-Z0-9]{10})"/g)].map((m) => m[1]))].slice(0, 3)
  console.log("\nQ:", q)
  for (const a of asins) {
    const p = await fetch(`https://www.amazon.co.jp/dp/${a}`, { headers: H }).then((r) => r.text())
    const title = p.match(/id="productTitle"[^>]*>([\s\S]*?)<\//)?.[1]?.replace(/\s+/g, " ").trim()?.slice(0, 90)
    const price = p.match(/￥([\d,]+)/)?.[1]
    if (title && /PROH7|EM-89|DM-1200|SM63|Samson Q6|MD-5A|D112|TKY-93|PGA58|BX3/i.test(title)) {
      console.log(" ", a, price, title)
    }
  }
}
