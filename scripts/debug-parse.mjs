const headers = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0.0.0 Safari/537.36",
  "Accept-Language": "ja-JP,ja;q=0.9",
}
const html = await (
  await fetch("https://www.amazon.co.jp/gp/bestsellers/computers/2151978051", {
    headers,
  })
).text()

const ranks = [...html.matchAll(/zg-bdg-text">#(\d+)</g)].map((m) => m[1])
console.log("ranks", ranks.length, ranks.slice(0, 5), ranks.slice(-3))

const re =
  /zg-bdg-text">#(\d+)<\/span>[\s\S]*?data-asin="([A-Z0-9]{10})"[\s\S]*?p13n-sc-css-line-clamp-2[^>]*>([\s\S]*?)<\/div>/g
const items = [...html.matchAll(re)]
console.log("simple re", items.length)
if (items[0]) console.log("first title", items[0][3].slice(0, 80))
