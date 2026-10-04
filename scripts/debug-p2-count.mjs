const headers = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0.0.0 Safari/537.36",
  "Accept-Language": "ja-JP,ja;q=0.9",
}
const url =
  "https://www.amazon.co.jp/gp/bestsellers/computers/2151978051/ref=zg_bs_pg_2?pg=2"
const html = await (await fetch(url, { headers })).text()
const ranks = [...html.matchAll(/zg-bdg-text">#(\d+)</g)].map((m) => Number(m[1]))
const asins = html.split(/<div data-asin="/).length - 1
console.log("ranks", ranks.length, "min", Math.min(...ranks), "max", Math.max(...ranks))
console.log("asins", asins)
