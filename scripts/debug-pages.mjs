const headers = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0.0.0 Safari/537.36",
  "Accept-Language": "ja-JP,ja;q=0.9",
}
for (const pg of [3, 4]) {
  const url = `https://www.amazon.co.jp/gp/bestsellers/computers/2151978051/ref=zg_bs_pg_${pg}?pg=${pg}`
  const html = await (await fetch(url, { headers })).text()
  const ranks = [...html.matchAll(/zg-bdg-text">#(\d+)</g)].map((m) => m[1])
  console.log("pg", pg, "ranks", ranks.length, ranks[0], ranks.at(-1))
}
