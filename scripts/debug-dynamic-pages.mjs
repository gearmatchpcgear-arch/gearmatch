const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131 Safari/537.36",
  "Accept-Language": "ja-JP,ja;q=0.9",
}
for (const pg of [2, 3, 4]) {
  const url =
    pg === 1
      ? "https://www.amazon.co.jp/gp/bestsellers/musical-instruments/2130075051"
      : `https://www.amazon.co.jp/gp/bestsellers/musical-instruments/2130075051/ref=zg_bs_pg_${pg}_musical-instruments?ie=UTF8&pg=${pg}`
  const h = await fetch(url, { headers: HEADERS }).then((r) => r.text())
  const ranks = [...h.matchAll(/zg-bdg-text">#(\d+)</g)].map((m) => m[1])
  console.log(`pg${pg} len=${h.length} ranks=${ranks.length} first=${ranks[0]} last=${ranks[ranks.length - 1]}`)
  if (ranks.length) console.log(" ", ranks.join(","))
}
