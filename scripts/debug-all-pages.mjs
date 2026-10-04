const headers = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0.0.0 Safari/537.36",
  "Accept-Language": "ja-JP,ja;q=0.9",
}
const urls = [
  "https://www.amazon.co.jp/gp/bestsellers/computers/2151978051",
  "https://www.amazon.co.jp/gp/bestsellers/computers/2151978051/ref=zg_bs_pg_2?pg=2",
  "https://www.amazon.co.jp/gp/bestsellers/computers/2151978051/ref=zg_bs_pg_3?pg=3",
  "https://www.amazon.co.jp/gp/bestsellers/computers/2151978051/ref=zg_bs_pg_4?pg=4",
]
for (const url of urls) {
  const html = await (await fetch(url, { headers })).text()
  const ranks = [...html.matchAll(/zg-bdg-text">#(\d+)</g)].map((m) => Number(m[1]))
  if (ranks.length === 0) {
    console.log(url.split("pg=")[1] ?? "1", "empty")
    continue
  }
  console.log(
    url.includes("pg=") ? "pg" + url.split("pg=")[1] : "p1",
    ranks.length,
    `${Math.min(...ranks)}-${Math.max(...ranks)}`,
  )
  await new Promise((r) => setTimeout(r, 1500))
}
