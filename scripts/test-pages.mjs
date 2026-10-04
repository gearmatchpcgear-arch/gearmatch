const urls = [
  "https://www.amazon.co.jp/gp/bestsellers/computers/2151978051/ref=zg_bs_pg_3?pg=3",
  "https://www.amazon.co.jp/gp/bestsellers/computers/2151978051/ref=zg_bs_pg_4?pg=4",
]
const H = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0.0.0 Safari/537.36",
  "Accept-Language": "ja-JP,ja;q=0.9",
}
for (const url of urls) {
  const r = await fetch(url, { headers: H })
  const t = await r.text()
  const ranks = [...t.matchAll(/zg-bdg-text">#(\d+)</g)].map((m) => m[1])
  console.log(url.includes("pg=3") ? "pg3" : "pg4", r.status, ranks.length, ranks.slice(0, 3), "...", ranks.slice(-3))
  await new Promise((x) => setTimeout(x, 2500))
}
